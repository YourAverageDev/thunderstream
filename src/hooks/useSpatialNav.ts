import { useEffect } from "react";
import { resolveTvKey } from "@/lib/tvKeys";
import { exitTizenApp, isTizenWidget } from "@/lib/tizen";

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

function playerIsOpen() {
  return !!document.querySelector<HTMLElement>('[data-tv-player="open"]');
}

function candidates(): HTMLElement[] {
  return Array.from(activeScope().querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
}

function preferredCandidate(items: HTMLElement[]) {
  return items.find((el) => el.dataset.tvPrimary === "true") ?? items[0];
}

function move(dir: "up" | "down" | "left" | "right") {
  const current = (document.activeElement as HTMLElement | null) ?? null;
  const items = candidates();
  if (!items.length) return;
  if (!current || current === document.body) {
    // Focus can end up orphaned on <body> (e.g. after a modal that held
    // focus unmounts). Scroll the target into view too, not just focus it —
    // otherwise the page silently jumps focus back to the top candidate
    // with no visible movement, which looks exactly like scrolling is
    // broken when the user is actually still scrolled further down.
    const target = preferredCandidate(items);
    target?.focus();
    target?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
    return;
  }

  if (playerIsOpen()) {
    const index = items.indexOf(current);
    const nextIndex =
      dir === "right" || dir === "down"
        ? index === -1 ? 0 : (index + 1) % items.length
        : index === -1 ? items.length - 1 : (index - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
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
    // "auto" (effectively instant, absent a global smooth-scroll CSS override)
    // instead of "smooth" — repeated smooth-scroll animation on every single
    // D-pad press feels sluggish; TV navigation should snap immediately.
    best.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
    return;
  }

  // No focusable candidate that way — don't just do nothing. Sparse regions
  // (a paragraph of text, hero imagery, gaps between sections) have no
  // focusable element to land on, which otherwise traps the D-pad with no
  // way to keep scrolling through them. Fall back to scrolling the page.
  if (dir === "down" || dir === "up") {
    window.scrollBy({ top: dir === "down" ? 240 : -240, behavior: "auto" });
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
      // Don't hijack typing, and don't hijack <select> — it needs its own
      // native key handling (arrows to change/cycle value, Enter/Space to
      // open the dropdown). Intercepting those here with preventDefault()
      // + el.click() breaks every provider/source dropdown on a remote:
      // .click() doesn't reliably open a native <select> popup, and
      // preventDefault() blocks the browser's own default handling that
      // otherwise would have.
      const tag = (e.target as HTMLElement)?.tagName;
      const isFormControl = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
      const key = resolveTvKey(e);

      switch (key) {
        case "ArrowRight": if (!isFormControl) { e.preventDefault(); move("right"); } break;
        case "ArrowLeft":  if (!isFormControl) { e.preventDefault(); move("left"); }  break;
        case "ArrowDown":  if (!isFormControl) { e.preventDefault(); move("down"); }  break;
        case "ArrowUp":    if (!isFormControl) { e.preventDefault(); move("up"); }    break;
        case "Enter":
        case " ": {
          const el = document.activeElement as HTMLElement | null;
          if (el && el !== document.body && !isFormControl) {
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
          if (!isFormControl) {
            e.preventDefault();
            if (closePlayerIfOpen()) break;
            // Samsung's certification guidelines require Back to exit the
            // app from its home screen rather than leaving the remote
            // stuck on a page with nowhere left to go back to.
            if (isTizenWidget() && window.location.pathname === "/") {
              exitTizenApp();
              break;
            }
            history.back();
          }
          break;
        // Tizen's dedicated hardware Exit key — always quits, regardless
        // of what's on screen (never treated as page-back).
        case "TizenExit":
          e.preventDefault();
          exitTizenApp();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    // Give first focus to first focusable so the remote has a starting point
    setTimeout(() => {
      if (document.activeElement === document.body) {
        preferredCandidate(candidates())?.focus();
      }
    }, 300);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
