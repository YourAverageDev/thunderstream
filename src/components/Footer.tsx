import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-16">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded"
            style={{ background: "var(--gradient-thunder)" }}
          >
            <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-display text-lg tracking-wider">
            THUNDER<span className="text-gradient-thunder">MOVIES</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-xl">
          ThunderMovies does not host any files. All content is indexed from publicly available
          third-party sources. For entertainment and informational purposes only.
        </p>
      </div>
    </footer>
  );
}
