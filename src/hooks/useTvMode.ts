import { useEffect, useState } from "react";

function lockLandscape() {
  if (typeof screen === "undefined") return;
  const orientation = (screen as any).orientation;
  if (orientation?.lock) orientation.lock("landscape").catch(() => {});
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
    root.classList.add("landscape-app");
    lockLandscape();

    const retryLandscapeLock = () => lockLandscape();
    window.addEventListener("click", retryLandscapeLock, { passive: true });
    window.addEventListener("keydown", retryLandscapeLock, { passive: true });
    window.addEventListener("touchstart", retryLandscapeLock, { passive: true });

    const active = isTvDevice();
    setTv(active);
    if (active) {
      root.classList.add("tv-mode");
      // Lock landscape when we can (APK / supported browsers)
      lockLandscape();
    } else {
      root.classList.remove("tv-mode");
    }

    return () => {
      window.removeEventListener("click", retryLandscapeLock);
      window.removeEventListener("keydown", retryLandscapeLock);
      window.removeEventListener("touchstart", retryLandscapeLock);
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
