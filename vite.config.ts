// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Outside a Lovable build (e.g. when deploying from GitHub to Netlify or
  // Vercel), Nitro needs an explicit preset for its function output format.
  // Inside Lovable, this is ignored and Cloudflare is forced.
  // Vercel sets VERCEL=1 during its build — detect it so `vercel deploy`
  // doesn't get Netlify's function format. Defaults to Netlify otherwise.
  nitro: { preset: process.env.VERCEL ? "vercel" : "netlify" },
});
