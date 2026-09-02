#!/usr/bin/env node
// Builds tizen/ThunderStream.wgt — an unsigned Tizen widget package for
// Samsung Smart TVs. Point it at your deployed ThunderStream URL:
//
//   THUNDERSTREAM_APP_URL=https://your-deployment.example npm run build:tizen
//
// The resulting .wgt is unsigned on purpose: sign and install it onto a TV
// with a tool like Apps2Samsung (https://github.com/Apps2Samsung/Apps2Samsung)
// or Samsung's own Tizen Studio. See tizen/README.md for the full flow.
import { execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tizenDir = path.join(rootDir, "tizen");
const stageDir = path.join(rootDir, ".tizen-stage");
const outFile = path.join(tizenDir, "ThunderStream.wgt");

const appUrl = process.env.THUNDERSTREAM_APP_URL;
if (!appUrl || !/^https:\/\/.+/.test(appUrl)) {
  console.error(
    "Error: THUNDERSTREAM_APP_URL is not set to a valid https:// URL.\n\n" +
      "This must be ThunderStream's own deployed URL (Netlify/Vercel/custom\n" +
      "domain) — the .wgt just tells the TV to load it, it doesn't bundle the\n" +
      "app. Example:\n\n" +
      "  THUNDERSTREAM_APP_URL=https://thunderstream.example.com npm run build:tizen\n",
  );
  process.exit(1);
}

rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });

const configTemplate = readFileSync(path.join(tizenDir, "config.xml"), "utf8");
writeFileSync(
  path.join(stageDir, "config.xml"),
  configTemplate.replace("__THUNDERSTREAM_APP_URL__", appUrl),
);
copyFileSync(path.join(tizenDir, "icon.png"), path.join(stageDir, "icon.png"));

rmSync(outFile, { force: true });
execFileSync("zip", ["-r", "-X", outFile, "config.xml", "icon.png"], { cwd: stageDir, stdio: "inherit" });

rmSync(stageDir, { recursive: true, force: true });

console.log(`\nBuilt ${path.relative(rootDir, outFile)} (points at ${appUrl}).`);
console.log("This .wgt is unsigned — sign & install it with Apps2Samsung or Tizen Studio.");
