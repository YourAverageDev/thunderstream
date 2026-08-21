import { useEffect, useState } from "react";

export function lockLandscape() {
  // Some WebView-wrapper runtimes (APK builders used to ship this as a TV
  // app) inject a broken `screen.orientation.lock` shim that throws
  // synchronously instead of rejecting a promise — wrap the whole call so
  // that can never crash the app.
  try {
    if (typeof screen === "undefined") return;
    const orientation = (screen as any).orientation;
    if (orientation?.lock) orientation.lock("landscape").catch(() => {});
  } catch {}
}

export function unlockOrientation() {
  if (typeof screen === "undefined") return;
  const orientation = (screen as any).orientation;
  if (orientation?.unlock) {
    try {
      orientation.unlock();
    } catch {}
  }
}

/**
 * Detects TV / Fire TV / Android TV / smart TV browsers and toggles
 * a global `tv-mode` class on <html> so CSS can adapt.
 *
 * Detection signals (any one is enough):
 *  - UA contains AFT (Fire TV), SMART-TV, GoogleTV, AndroidTV, BRAVIA,
 *    Tizen, Web0S / WebOS, HbbTV, NetCast, DTV
 *  - Coarse pointer + no touch + large viewport (typical for STB/TV browser)
 *  - `?tv=1` query param (manual override for testing / APK)
 */
export function isTvDevice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("tv") === "0") return false;
    if (url.searchParams.get("tv") === "1") return true;
  } catch {}

  const ua = navigator.userAgent || "";
  const tvUa = /AFT|Fire TV|SMART-?TV|SmartTV|GoogleTV|Android TV|BRAVIA|Tizen|Web0S|WebOS|NetCast|HbbTV|DTV|Roku|AppleTV|CrKey/i;
  if (tvUa.test(ua)) return true;

  // Android WebView packaged as APK on a TV: no touch + big screen + landscape
  const noTouch = !("ontouchstart" in window) && (navigator.maxTouchPoints ?? 0) === 0;
  const bigLandscape = window.innerWidth >= 1280 && window.innerWidth > window.innerHeight;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  if (noTouch && bigLandscape && coarse) return true;

  return false;
}

export function useTvMode() {
  const [tv, setTv] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const active = isTvDevice();
    setTv(active);

    // Never force landscape/10-foot UI on phones & tablets — only real
    // TV/STB browsers get the forced-landscape + tv-mode treatment.
    if (!active) {
      root.classList.remove("tv-mode");
      return;
    }

    root.classList.add("tv-mode");
    lockLandscape();

    // Orientation lock can need a user gesture to succeed on some browsers.
    // Retry once on the first interaction, then stop — do NOT re-attempt on
    // every keypress/click. On weak Fire TV Stick hardware, calling this on
    // every single D-pad press during navigation is wasted work that shows
    // up as sluggishness. Real device orientation should come from the TV's
    // own orientation-lock app; this is just a best-effort nudge.
    const retryLandscapeLockOnce = () => {
      lockLandscape();
      window.removeEventListener("click", retryLandscapeLockOnce);
      window.removeEventListener("keydown", retryLandscapeLockOnce);
      window.removeEventListener("touchstart", retryLandscapeLockOnce);
    };
    window.addEventListener("click", retryLandscapeLockOnce, { passive: true });
    window.addEventListener("keydown", retryLandscapeLockOnce, { passive: true });
    window.addEventListener("touchstart", retryLandscapeLockOnce, { passive: true });

    return () => {
      window.removeEventListener("click", retryLandscapeLockOnce);
      window.removeEventListener("keydown", retryLandscapeLockOnce);
      window.removeEventListener("touchstart", retryLandscapeLockOnce);
    };
  }, []);

  return tv;
}

export function useIsTvMode() {
  const [tv, setTv] = useState(false);

  useEffect(() => {
    const update = () => setTv(isTvDevice() || document.documentElement.classList.contains("tv-mode"));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return tv;
}
