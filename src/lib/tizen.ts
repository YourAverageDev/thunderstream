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

type TizenGlobal = {
  tvinputdevice?: { registerKey: (key: string) => void };
  application?: { getCurrentApplication: () => { exit: () => void } };
};

function getTizen(): TizenGlobal | undefined {
  return typeof window !== "undefined"
    ? (window as unknown as { tizen?: TizenGlobal }).tizen
    : undefined;
}

export function isTizenWidget(): boolean {
  return typeof getTizen()?.tvinputdevice?.registerKey === "function";
}

export function registerTizenKeys() {
  const tvinputdevice = getTizen()?.tvinputdevice;
  if (!tvinputdevice) return;
  // Every Tizen TV app already receives Back/Exit unregistered, but
  // registering both explicitly is what Samsung's own sample apps do —
  // it costs nothing if it's already implicit, and reliable Back/Exit
  // handling matters more than almost anything else in a TV app, so this
  // is worth the redundant belt-and-suspenders call.
  for (const key of ["Return", "Exit"]) {
    try {
      tvinputdevice.registerKey(key);
    } catch {
      // Some Tizen versions reject registering certain keys — harmless.
    }
  }
}

export function exitTizenApp() {
  try {
    getTizen()?.application?.getCurrentApplication().exit();
  } catch {
    // No-op: nothing more we can do if the platform call itself fails.
  }
}
