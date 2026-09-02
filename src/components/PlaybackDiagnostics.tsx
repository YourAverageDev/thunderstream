import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";
import {
  collectPlaybackDiagnostics,
  type PlaybackDiagnosticsSnapshot,
} from "@/lib/playbackDiagnostics";

// A button that reveals a plain-text panel of real platform capability
// data, right on screen — the substitute for DevTools on a device that
// can't have DevTools attached to it. With autoOpen, it shows itself
// automatically a few seconds in (TV mode) instead of requiring someone
// to find and press an unfamiliar button on a remote first.
export function PlaybackDiagnostics({ autoOpen = false }: { autoOpen?: boolean }) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<PlaybackDiagnosticsSnapshot | null>(null);
  const errorsRef = useRef<string[]>([]);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      errorsRef.current = [...errorsRef.current, e.message].slice(-8);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      errorsRef.current = [...errorsRef.current, `unhandled rejection: ${String(e.reason)}`].slice(
        -8,
      );
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    if (!autoOpen) return;
    // Wait a few seconds so a slow-to-fail provider has time to actually
    // throw whatever error it's going to throw before the snapshot is taken.
    const timer = window.setTimeout(() => {
      setSnapshot(collectPlaybackDiagnostics(errorsRef.current));
      setOpen(true);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [autoOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSnapshot(collectPlaybackDiagnostics(errorsRef.current));
          setOpen(true);
        }}
        className="inline-grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary"
        aria-label="Playback diagnostics"
      >
        <Info className="h-4 w-4" />
      </button>
      {open && snapshot && (
        <div
          data-tv-modal="open"
          className="fixed inset-0 z-[200] grid place-items-center bg-black/80 p-6"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Backspace") {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <div
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl border border-border bg-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg">Playback diagnostics</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                data-tv-primary="true"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">
              {[
                `User-Agent: ${snapshot.userAgent}`,
                `Tizen version: ${snapshot.tizenVersion ?? "n/a (not detected in UA)"}`,
                `MediaSource Extensions: ${snapshot.mediaSource ? "yes" : "NO"}`,
                `Encrypted Media (EME): ${snapshot.eme ? "yes" : "NO"}`,
                "",
                "Codec/container support (MediaSource.isTypeSupported):",
                ...snapshot.mediaSourceTypes.map(
                  (t) => `  ${t.supported ? "OK  " : "FAIL"}  ${t.type}`,
                ),
                "",
                `Recent page errors (${snapshot.errors.length}):`,
                ...(snapshot.errors.length
                  ? snapshot.errors.map((e) => `  - ${e}`)
                  : ["  (none captured)"]),
              ].join("\n")}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
