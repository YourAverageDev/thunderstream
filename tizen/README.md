# ThunderStream for Samsung Tizen TV

This packages ThunderStream as a Tizen **hosted web application** — a
`.wgt` that tells the TV to load ThunderStream's own deployed URL
fullscreen, rather than bundling a copy of the site.

That's a deliberate choice, not a shortcut: ThunderStream's `/api/*` routes
(`tmdb`, `omdb`, `jikan`, `tvmaze`, `anilist`) proxy those services using
server-side secret API keys (see `netlify.toml` / `vercel.json`). A Tizen
widget only ever runs static files with no server behind it, so a locally
bundled copy could never reach those keys or those routes — it would just
be a dead app. Pointing the widget at the real deployment is the only way
the app can work on the TV at all, and it means every fix/update you ship
to production is live on the TV instantly, with nothing to re-package.

## 1. Build the `.wgt`

You need ThunderStream's own deployed URL (Netlify, Vercel, or a custom
domain — wherever `npm run build` from the repo root actually gets
deployed):

```sh
THUNDERSTREAM_APP_URL=https://your-deployment.example npm run build:tizen
```

This writes `tizen/ThunderStream.wgt` (gitignored — it's a build output,
regenerate it whenever the URL changes). It is **unsigned** on purpose:
Tizen requires every app to be signed with a certificate before a TV will
install it, and that step is what the signing tool below does for you.

## 2. Sign & install with Apps2Samsung

[Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases) is a
cross-platform tool built exactly for this: point it at `ThunderStream.wgt`
and it generates a matching certificate, signs the package, finds your TV
on the network, and installs it — no Tizen Studio or Samsung developer
account required. Download the latest release for your OS, add the `.wgt`
from step 1, and follow its install flow.

(Tizen Studio + `sdb`/the official Samsung Certificate Manager work too,
if you'd rather go that route — the `.wgt` here is a standard unsigned
Tizen widget package either way.)

## What's actually TV-specific here

- **`config.xml`** — the widget manifest: app id/name, 1920×1080 landscape
  viewport, the `internet` and `tv.inputdevice` privileges the app needs,
  and a permissive `tizen:content-security-policy` (the real security
  boundary is whatever the production deployment's own HTTPS response
  enforces — this just avoids Tizen's own packaged-content CSP getting in
  the way of a *hosted* app).
- **`icon.png`** — the TV home screen icon (ThunderStream's existing
  favicon artwork).
- **Remote control & app lifecycle** live in the app itself
  (`src/lib/tizen.ts`, `src/hooks/useSpatialNav.ts`, `src/lib/tvKeys.ts`),
  guarded so they only activate when `window.tizen` exists — i.e. only
  when actually running inside this packaged widget:
  - D-pad navigation, focus movement, and orientation lock were already
    built out for Fire TV/Android TV (`useSpatialNav`, `useTvMode`) and
    apply here unchanged — Tizen's browser reports arrow keys/Enter
    natively, so remote navigation is smooth with no TV-specific work
    needed on that front.
  - The **Back** key (Tizen keycode `10009`) closes an open player, then
    walks back through in-app navigation, then — matching Samsung's
    certification guidelines — **exits the app** once Back is pressed
    from the home screen, instead of leaving the remote stuck with
    nowhere left to go.
  - The dedicated hardware **Exit** key (keycode `10182`) always quits
    immediately, everywhere, per Tizen convention — it's never treated as
    page-back.
  - Screen orientation is a non-issue on real Tizen TV hardware (it's
    always a fixed 1920×1080 landscape panel); the existing
    `lockLandscape()` orientation-API calls remain harmless no-ops there
    and still matter for the same codebase running on phones/tablets.

## Language

The app is English-only end to end — `<html lang="en">` in the root
route, and every string in this widget's `config.xml`/`name` — regardless
of what device or app it's compared against.
