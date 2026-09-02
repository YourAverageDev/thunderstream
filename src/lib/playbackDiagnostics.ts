// A one-shot, on-screen platform capability snapshot. This exists because
// there's no way to attach real DevTools to a TV: when a video plays fine
// on desktop but shows black on a TV's own browser engine, the only way to
// find out *why* — missing MediaSource support, no EME, an unsupported
// codec, an old Tizen version — is to have the page report it directly,
// visible on the TV screen itself.
export type PlaybackDiagnosticsSnapshot = {
  userAgent: string;
  tizenVersion: string | null;
  mediaSource: boolean;
  mediaSourceTypes: { type: string; supported: boolean }[];
  eme: boolean;
  errors: string[];
};

const CHECK_TYPES = [
  'video/mp4; codecs="avc1.42E01E"',
  'video/mp4; codecs="hvc1.1.6.L93.90"',
  "application/vnd.apple.mpegurl",
  "video/mp2t",
];

export function collectPlaybackDiagnostics(errors: string[]): PlaybackDiagnosticsSnapshot {
  const hasMediaSource = typeof window !== "undefined" && "MediaSource" in window;
  const mediaSourceTypes = CHECK_TYPES.map((type) => ({
    type,
    supported: hasMediaSource ? safeIsTypeSupported(type) : false,
  }));
  return {
    userAgent: navigator.userAgent,
    tizenVersion: getTizenVersion(),
    mediaSource: hasMediaSource,
    mediaSourceTypes,
    eme: typeof navigator.requestMediaKeySystemAccess === "function",
    errors,
  };
}

function safeIsTypeSupported(type: string): boolean {
  try {
    return (
      window as unknown as { MediaSource: { isTypeSupported: (t: string) => boolean } }
    ).MediaSource.isTypeSupported(type);
  } catch {
    return false;
  }
}

function getTizenVersion(): string | null {
  const match = navigator.userAgent.match(/Tizen[ /]([\d.]+)/i);
  return match ? match[1] : null;
}
