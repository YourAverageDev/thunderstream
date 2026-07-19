import { useEffect } from "react";

/**
 * Minimal D-pad / arrow-key spatial navigation for TV remotes
 * (Fire TV, Android TV). Uses geometric distance between focusable
 * elements to pick the next focus target.
 *
 * Enter / Space / DPAD_CENTER (keyCode 13) → click focused element.
 * Backspace / Escape / DPAD_BACK (keyCode 8, 27, 461) → close player or browser back.
 */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function visible(el: Element) {
  const r = (el as HTMLElement).getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  if (r.bottom < 0 || r.top > window.innerHeight) return false;
  const cs = getComputedStyle(el as HTMLElement);
  return cs.visibility !== "hidden" && cs.display !== "none";
}

function activeScope(): ParentNode {
  return document.querySelector<HTMLElement>('[data-tv-player="open"]') ?? document;
}

function candidates(): HTMLElement[] {
  return Array.from(activeScope().querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
}

function move(dir: "up" | "down" | "left" | "right") {
  const current = (document.activeElement as HTMLElement | null) ?? null;
  const items = candidates();
  if (!items.length) return;
  if (!current || current === document.body) {
    items[0].focus();
    return;
  }
  const cr = current.getBoundingClientRect();
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of items) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const dx = ex - cx;
    const dy = ey - cy;

    let primary: number, secondary: number;
    if (dir === "right") { if (dx <= 4) continue; primary = dx; secondary = Math.abs(dy); }
    else if (dir === "left") { if (dx >= -4) continue; primary = -dx; secondary = Math.abs(dy); }
    else if (dir === "down") { if (dy <= 4) continue; primary = dy; secondary = Math.abs(dx); }
    else { if (dy >= -4) continue; primary = -dy; secondary = Math.abs(dx); }

    // weight cross-axis heavily so we stay in a "column"/"row"
    const score = primary + secondary * 2;
    if (score < bestScore) { bestScore = score; best = el; }
  }

  if (best) {
    best.focus();
    best.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }
}

function closePlayerIfOpen() {
  const close = document.querySelector<HTMLElement>('[data-tv-player="open"] [data-tv-close="true"]');
  if (!close) return false;
  close.click();
  return true;
}

export function useSpatialNav(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;

      switch (e.key) {
        case "ArrowRight": if (!isTyping) { e.preventDefault(); move("right"); } break;
        case "ArrowLeft":  if (!isTyping) { e.preventDefault(); move("left"); }  break;
        case "ArrowDown":  if (!isTyping) { e.preventDefault(); move("down"); }  break;
        case "ArrowUp":    if (!isTyping) { e.preventDefault(); move("up"); }    break;
        case "Enter":
        case " ": {
          const el = document.activeElement as HTMLElement | null;
          if (el && el !== document.body && !isTyping) {
            if (el.tagName === "IFRAME") return;
            e.preventDefault();
            el.click();
          }
          break;
        }
        case "Backspace":
        case "Escape":
        case "GoBack":
        case "BrowserBack":
          if (!isTyping) {
            e.preventDefault();
            if (!closePlayerIfOpen()) history.back();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    // Give first focus to first focusable so the remote has a starting point
    setTimeout(() => {
      if (document.activeElement === document.body) {
        const first = candidates()[0];
        first?.focus();
      }
    }, 300);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
