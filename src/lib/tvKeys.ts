// Normalizes remote-control keyboard events into standard DOM key names.
// Most modern Fire TV / Android TV WebViews map D-pad presses to proper
// `KeyboardEvent.key` values ("ArrowUp", "Enter", ...), but some packaged
// WebView wrappers and older Smart TV browsers (Tizen, webOS) only report
// a raw numeric `keyCode` for D-pad/back/select. This fills that gap so
// remote navigation keeps working across those devices.
const KNOWN_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  " ",
  "Backspace",
  "Escape",
  "GoBack",
  "BrowserBack",
  "TizenExit",
]);

const KEYCODE_TO_KEY: Record<number, string> = {
  19: "ArrowUp", // Android DPAD_UP
  20: "ArrowDown", // Android DPAD_DOWN
  21: "ArrowLeft", // Android DPAD_LEFT
  22: "ArrowRight", // Android DPAD_RIGHT
  23: "Enter", // Android DPAD_CENTER
  66: "Enter", // Android ENTER
  13: "Enter",
  32: " ",
  4: "Backspace", // Android BACK
  27: "Escape",
  111: "Escape", // Android ESCAPE
  461: "Backspace", // legacy Smart TV back button
  10009: "Backspace", // Tizen Return/back button
  // Tizen's dedicated hardware Exit key. Unlike Back, this always means
  // "quit the app" — never treat it as page-back navigation.
  10182: "TizenExit",
};

export function resolveTvKey(e: KeyboardEvent): string {
  if (KNOWN_KEYS.has(e.key)) return e.key;
  return KEYCODE_TO_KEY[e.keyCode] ?? e.key;
}

export const TV_BACK_KEYS = new Set(["Backspace", "Escape", "GoBack", "BrowserBack"]);
export const TV_NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);
export const TV_PREV_KEYS = new Set(["ArrowLeft", "ArrowUp"]);
export const TV_SELECT_KEYS = new Set(["Enter", " "]);
