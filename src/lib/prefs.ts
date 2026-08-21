// Small cross-cutting user preferences, shared across movie/TV and anime
// playback (lib/stream.ts, lib/animeStream.ts) and TV-mode detection
// (hooks/useTvMode.ts). Kept separate from those files since each of them
// already owns its own provider-specific localStorage keys.

const AUTOPLAY_KEY = "thunder_autoplay";

export function getAutoplayPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(AUTOPLAY_KEY) !== "0";
}

export function setAutoplayPreference(enabled: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(AUTOPLAY_KEY, enabled ? "1" : "0");
}

// All keys this app writes to localStorage, for a "reset preferences" action.
export const ALL_PREF_KEYS = [
  AUTOPLAY_KEY,
  "thunder_provider",
  "thunder_anime_provider",
  "thunder_anime_audio",
  "thunder_tv_mode",
] as const;

export function clearAllPreferences() {
  if (typeof window === "undefined") return;
  for (const key of ALL_PREF_KEYS) window.localStorage.removeItem(key);
}
