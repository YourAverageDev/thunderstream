# ThunderStream for Samsung Tizen TV
## 1. Enable Developer Mode on your Samsung TV(without this file transfer with apps2samsung is not possible)
Enable Developer mode on your samsung TV depending on the model, do it by pressing 1,2,3,4,5 on number keypad  in app settings and wait some 5 - 10 secs and developer mode will appear. But double check again on you model if doesn't work check in other sources for your model.
After developer settings open switch on developer mode enter the ip of your device you are going to use apps2samsung in.

## 2. Download wtg file from the releases section of this repo: https://github.com/YourAverageDev/thunderstream/releases

## 3. Sign & install with Apps2Samsung

[Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases) 
Apps2Samsung is what we use to send files from your device to app, Download Apps2Samsung from releases. After downloading select the dropdown from release and scroll down to bottom to find "Custom WTG file" select that then open file manager and select the wtg file downloaded from this repo. Note: Apps2samsung has a bug going on where if you install the apk version of it in your phone and select custom wtg it doesn't install on the TV, but this bug happened to me so installing Apps2Samsung on your phone isn't recommended. Scan the network for your TV or enter the TV ip manually after that select "Download and Install" and it should work as expected.

## 4. Enjoy ThunderStream on your Samsung TV


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
