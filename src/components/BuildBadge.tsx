import { BUILD_LABEL } from "@/lib/buildInfo";

// A deliberately impossible-to-miss strip at the very top of every screen,
// on every page, showing which build is actually running. Exists because
// "is this actually the updated file" kept coming up with no way to
// visually confirm it one way or the other.
export function BuildBadge() {
  return (
    <div className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center bg-black py-1 text-center text-xs font-bold tracking-wide text-primary">
      ThunderStream — {BUILD_LABEL}
    </div>
  );
}
