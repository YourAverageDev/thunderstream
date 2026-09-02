// Samsung Tizen TV widget integration.
//
// The app itself is never bundled for Tizen — the .wgt in /tizen packages
// only a config.xml + icon that points Tizen's "hosted web application"
// content loader at this site's own production URL (see tizen/config.xml).
// So this file is what actually runs on the TV: it detects that we're
// inside the packaged widget (the `tizen` global only exists there, never
// in a normal desktop/mobile browser) and wires up the handful of things a
// plain website can't do for itself — registering the hardware Back key
// and exiting the app on the dedicated Exit key.
export function isTizenWidget(): boolean {
  return typeof window !== "undefined" && typeof (window as any).tizen?.tvinputdevice?.registerKey === "function";
}

export function registerTizenKeys() {
  if (!isTizenWidget()) return;
  try {
    // Every Tizen TV app already receives the Back key ("Return", keyCode
    // 10009) unregistered, but registering it explicitly is what Samsung's
    // own sample apps do and costs nothing if it's already implicit.
    (window as any).tizen.tvinputdevice.registerKey("Return");
  } catch {}
}

export function exitTizenApp() {
  try {
    (window as any).tizen?.application?.getCurrentApplication().exit();
  } catch {}
}
