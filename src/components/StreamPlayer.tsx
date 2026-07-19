import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, RefreshCw, SkipForward, X } from "lucide-react";
import { ProviderSelect } from "@/components/ProviderSelect";
import { getNextTvProvider, type ProviderId } from "@/lib/stream";

type StreamPlayerProps = {
  title: string;
  streamUrl: string;
  providerId: ProviderId;
  isTvMode: boolean;
  meta?: string;
  onProviderChange: (id: ProviderId) => void;
  onClose: () => void;
};

export function StreamPlayer({
  title,
  streamUrl,
  providerId,
  isTvMode,
  meta,
  onProviderChange,
  onClose,
}: StreamPlayerProps) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const markerRef = useRef(`thunder-player-${Date.now()}`);
  const onCloseRef = useRef(onClose);
  const [reloadKey, setReloadKey] = useState(0);
  const frameSrc = useMemo(() => streamUrl, [streamUrl, reloadKey]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    window.history.pushState({ thunderPlayer: markerRef.current }, "", window.location.href);
    const onPopState = () => onCloseRef.current();
    window.addEventListener("popstate", onPopState);

    const focusTimer = window.setTimeout(() => {
      primaryRef.current?.focus();
    }, isTvMode ? 350 : 80);

    const focusWatchdog = isTvMode
      ? window.setInterval(() => {
          if (document.activeElement?.tagName === "IFRAME") {
            primaryRef.current?.focus();
          }
        }, 300)
      : undefined;

    return () => {
      window.clearTimeout(focusTimer);
      if (focusWatchdog) window.clearInterval(focusWatchdog);
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
      document.querySelectorAll<HTMLElement>('[data-tv-player="open"] button, [data-tv-player="open"] a[href]'),
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

  function nextSource() {
    onProviderChange(getNextTvProvider(providerId));
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
        if (["Escape", "Backspace", "GoBack", "BrowserBack"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          closePlayer();
          return;
        }

        if (["ArrowRight", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          movePlayerFocus("next");
          return;
        }

        if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          movePlayerFocus("previous");
          return;
        }

        if (["Enter", " "].includes(event.key)) {
          const active = document.activeElement as HTMLElement | null;
          if (active?.closest('[data-tv-player="open"]') && active.tagName !== "SELECT") {
            event.preventDefault();
            event.stopPropagation();
            active.click();
          }
        }
      }}
    >
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
          <ProviderSelect value={providerId} onChange={onProviderChange} />
          {isTvMode && (
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

      <div className="stream-player-video min-h-0 flex-1 bg-background">
        <iframe
          key={`${frameSrc}-${reloadKey}`}
          ref={frameRef}
          src={frameSrc}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; accelerometer; gyroscope"
          referrerPolicy="no-referrer"
          className="stream-frame h-full w-full"
          title={title}
          tabIndex={-1}
          data-tv-focusable="false"
          onLoad={() => {
            if (isTvMode) window.setTimeout(() => primaryRef.current?.focus(), 80);
          }}
        />
      </div>
    </div>
  );
}