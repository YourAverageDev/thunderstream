import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ExternalLink, Maximize2, MousePointer2, Minimize2, RefreshCw, SkipForward, X } from "lucide-react";
import { lockLandscape, unlockOrientation } from "@/hooks/useTvMode";
import {
  isPickerOpen,
  resolveTvKey,
  TV_BACK_KEYS,
  TV_NEXT_KEYS,
  TV_PREV_KEYS,
  TV_SELECT_KEYS,
} from "@/lib/tvKeys";
import { exitTizenApp } from "@/lib/tizen";

type StreamPlayerProps = {
  title: string;
  streamUrl: string;
  isTvMode: boolean;
  meta?: string;
  // Caller-owned provider picker UI (movie/TV's <ProviderSelect> or anime's
  // <AnimeProviderSelect> — StreamPlayer doesn't know which provider system
  // is in play, it just renders whatever control the page hands it).
  providerControl?: ReactNode;
  // Caller advances to the next source and returns the new stream URL isn't
  // needed here — it just needs to flip its own provider state; StreamPlayer
  // handles the reload/refocus that follows. Omit to hide the button.
  onNextSource?: () => void;
  onClose: () => void;
};

export function StreamPlayer({
  title,
  streamUrl,
  isTvMode,
  meta,
  providerControl,
  onNextSource,
  onClose,
}: StreamPlayerProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const markerRef = useRef(`thunder-player-${Date.now()}`);
  const onCloseRef = useRef(onClose);
  const [reloadKey, setReloadKey] = useState(0);
  const frameSrc = useMemo(() => streamUrl, [streamUrl, reloadKey]);
  // "Player only" mode: hides the whole controls bar so nothing but the
  // video shows. Exited via the floating button or Back/Escape.
  const [focusMode, setFocusMode] = useState(false);
  // On-screen cursor moved by the D-pad, for devices with no real pointer
  // hardware at all. It can click/focus our own controls directly (via
  // elementFromPoint), and can focus the video iframe — it cannot click
  // anything *inside* the iframe, since no script can dispatch a real
  // click across a cross-origin frame boundary; only genuine OS-level
  // pointer input can do that. This is the honest ceiling of what's
  // possible here, not a corner we cut.
  const [cursorMode, setCursorMode] = useState(false);
  // Position is a ref, not state — moving the cursor must NOT trigger a
  // React re-render of this whole component on every single keypress.
  // That's exactly what made it feel sluggish: a full render pass on a
  // component with a heavy iframe sibling, on weak Fire TV Stick hardware,
  // for every single D-pad step. The DOM node's position is set directly.
  const cursorPosRef = useRef({ x: 0, y: 0 });
  const cursorElRef = useRef<HTMLDivElement | null>(null);
  const CURSOR_STEP = 64;

  function applyCursorPos() {
    const el = cursorElRef.current;
    if (el) {
      el.style.left = `${cursorPosRef.current.x}px`;
      el.style.top = `${cursorPosRef.current.y}px`;
    }
  }

  useEffect(() => {
    if (cursorMode) applyCursorPos();
  }, [cursorMode]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Whatever was focused when the player opened (the "Play"/episode
    // button) gets removed from the DOM when this unmounts if it was
    // inside the player's own controls, or is just left behind otherwise —
    // either way, restore focus to it on close instead of letting focus
    // fall back to <body>. Orphaned body focus meant the next D-pad press
    // silently snapped back to the page's top focusable element with no
    // visible scroll, which looked exactly like scrolling had stopped
    // working after watching something.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    return () => {
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    // On phones/tablets, prefer landscape while the video is open (best-effort —
    // most mobile browsers require fullscreen for this to succeed) and restore
    // free rotation on close. TV stays locked to landscape at the app level.
    if (isTvMode) return;
    lockLandscape();
    return () => unlockOrientation();
  }, [isTvMode]);

  useEffect(() => {
    window.history.pushState({ thunderPlayer: markerRef.current }, "", window.location.href);
    const onPopState = () => onCloseRef.current();
    window.addEventListener("popstate", onPopState);

    const focusTimer = window.setTimeout(() => {
      primaryRef.current?.focus();
    }, isTvMode ? 350 : 80);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isTvMode]);

  function closePlayer() {
    if (window.history.state?.thunderPlayer === markerRef.current) {
      window.history.back();
      window.setTimeout(() => onCloseRef.current(), 120);
      return;
    }
    onCloseRef.current();
  }

  function playerControls() {
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-tv-player="open"] button, [data-tv-player="open"] a[href], [data-tv-player="open"] select, [data-tv-player="open"] iframe',
      ),
    ).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    });
  }

  function movePlayerFocus(direction: "next" | "previous") {
    const controls = playerControls();
    if (!controls.length) return;
    const currentIndex = controls.indexOf(document.activeElement as HTMLElement);
    const fallbackIndex = direction === "next" ? 0 : controls.length - 1;
    const nextIndex =
      currentIndex === -1
        ? fallbackIndex
        : direction === "next"
          ? (currentIndex + 1) % controls.length
          : (currentIndex - 1 + controls.length) % controls.length;
    controls[nextIndex]?.focus();
  }

  function focusVideo() {
    setReloadKey((key) => key + 1);
  }

  function toggleCursorMode() {
    setCursorMode((active) => {
      if (active) return false;
      cursorPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      return true;
    });
  }

  function moveCursor(dx: number, dy: number) {
    cursorPosRef.current = {
      x: Math.min(Math.max(cursorPosRef.current.x + dx, 0), window.innerWidth),
      y: Math.min(Math.max(cursorPosRef.current.y + dy, 0), window.innerHeight),
    };
    applyCursorPos();
  }

  function clickAtCursor() {
    const { x, y } = cursorPosRef.current;
    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!target) return;
    // For our own controls this is a real click. For the video iframe, a
    // click on the iframe *element* can't reach anything inside it — the
    // real value here is the .focus() call, which hands it genuine
    // keyboard focus so Enter/Space/arrows can be forwarded to whatever
    // the embedded player supports natively (see the key handler below).
    target.focus?.();
    target.click?.();
  }

  function nextSource() {
    onNextSource?.();
    setReloadKey((key) => key + 1);
    window.setTimeout(() => primaryRef.current?.focus(), 200);
  }

  return (
    <div
      className="stream-player-shell fixed inset-0 z-[100] flex flex-col bg-background"
      data-tv-player="open"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDownCapture={(event) => {
        const key = resolveTvKey(event.nativeEvent);

        // The hardware Exit key always quits the whole app, even from
        // inside the player — never just close the player for it.
        if (key === "TizenExit") {
          event.preventDefault();
          event.stopPropagation();
          exitTizenApp();
          return;
        }

        // The source-picker popover (our own Select-based dropdown) has to
        // handle every key itself while it's open — otherwise Back would
        // close the whole player instead of just closing the dropdown.
        if (isPickerOpen()) return;

        if (TV_BACK_KEYS.has(key)) {
          event.preventDefault();
          event.stopPropagation();
          if (cursorMode) {
            setCursorMode(false);
            return;
          }
          if (focusMode) {
            setFocusMode(false);
            return;
          }
          closePlayer();
          return;
        }

        if (cursorMode) {
          event.preventDefault();
          event.stopPropagation();
          if (key === "ArrowUp") moveCursor(0, -CURSOR_STEP);
          else if (key === "ArrowDown") moveCursor(0, CURSOR_STEP);
          else if (key === "ArrowLeft") moveCursor(-CURSOR_STEP, 0);
          else if (key === "ArrowRight") moveCursor(CURSOR_STEP, 0);
          else if (key === "Enter" || key === " ") clickAtCursor();
          return;
        }

        // A focused <iframe> needs every key left alone — the embedded video
        // player inside it is the only thing that can actually react to
        // Enter/Space (play/pause) or arrows (seek), and only if the browser
        // is allowed to forward real, trusted key events into it.
        // Intercepting those here (preventDefault + a no-op .click() on the
        // iframe element) was blocking the one way a remote-only user could
        // ever start playback on providers that require a keypress/click
        // past their own "tap to play" overlay.
        const active = document.activeElement as HTMLElement | null;
        if (active?.tagName === "IFRAME") return;

        if (TV_NEXT_KEYS.has(key)) {
          event.preventDefault();
          event.stopPropagation();
          movePlayerFocus("next");
          return;
        }

        if (TV_PREV_KEYS.has(key)) {
          event.preventDefault();
          event.stopPropagation();
          movePlayerFocus("previous");
          return;
        }

        if (TV_SELECT_KEYS.has(key)) {
          if (active?.closest('[data-tv-player="open"]')) {
            event.preventDefault();
            event.stopPropagation();
            active.click();
          }
        }
      }}
    >
      {focusMode ? (
        <button
          type="button"
          autoFocus
          onClick={() => setFocusMode(false)}
          className="absolute top-3 right-3 z-10 inline-grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          aria-label="Exit player-only mode"
          data-tv-primary="true"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      ) : (
        <div className="stream-player-controls flex min-h-16 w-full items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 md:px-6">
          <div className="min-w-0 flex items-center gap-3">
            <button
              ref={primaryRef}
              type="button"
              onClick={focusVideo}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
              aria-label="Restart player"
              data-tv-primary="true"
            >
              ▶
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{title}</p>
              {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {providerControl}
            {isTvMode && onNextSource && (
              <button
                type="button"
                onClick={nextSource}
                className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary"
                aria-label="Next source"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary"
              aria-label="Reload player"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setFocusMode(true)}
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary"
              aria-label="Player-only mode"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            {isTvMode && (
              <button
                type="button"
                onClick={toggleCursorMode}
                className={`inline-grid h-10 w-10 place-items-center rounded-full hover:bg-secondary ${cursorMode ? "bg-primary text-primary-foreground" : "bg-secondary/80"}`}
                aria-label="Toggle on-screen cursor"
              >
                <MousePointer2 className="h-4 w-4" />
              </button>
            )}
            {!isTvMode && (
              <a
                href={streamUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-secondary/80 px-3 text-xs hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open externally
              </a>
            )}
            <button
              type="button"
              onClick={closePlayer}
              className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary"
              aria-label="Close player"
              data-tv-close="true"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="stream-player-video min-h-0 flex-1 bg-background">
        <iframe
          key={`${frameSrc}-${reloadKey}`}
          ref={frameRef}
          src={frameSrc}
          allowFullScreen
          // Trimmed to what a TV set-top actually needs — accelerometer/
          // gyroscope/picture-in-picture are mobile-only permissions with no
          // TV meaning, carried over from a template and never used here.
          allow="autoplay; encrypted-media; fullscreen"
          // Embed providers (vidlink, 2embed, etc.) load ad scripts that try
          // to redirect the whole tab or pop up new windows/tabs. Sandboxing
          // without allow-top-navigation/allow-popups makes the browser
          // itself refuse those, regardless of what the ad script does —
          // allow-same-origin keeps the provider's own login/DRM/session
          // storage working, and allow-fullscreen/allow-pointer-lock keep
          // the actual player UI intact.
          sandbox="allow-scripts allow-same-origin allow-forms allow-fullscreen allow-pointer-lock"
          referrerPolicy="origin"
          className="stream-frame h-full w-full"
          title={title}
          tabIndex={0}
          onLoad={() => {
            if (isTvMode) window.setTimeout(() => primaryRef.current?.focus(), 80);
          }}
        />
      </div>

      {cursorMode && (
        <div ref={cursorElRef} className="pointer-events-none fixed z-50 -translate-x-1 -translate-y-1">
          <MousePointer2 className="h-7 w-7 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" fill="white" />
        </div>
      )}
    </div>
  );
}