import { Link } from "@tanstack/react-router";
import { Zap, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg"
            style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}
          >
            <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
          </div>
          <span className="font-display text-2xl tracking-wider">
            THUNDER<span className="text-gradient-thunder">MOVIES</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Home
          </Link>
          <Link to="/movies" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Movies
          </Link>
          <Link to="/tv" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            TV Shows
          </Link>
        </nav>

        <form
          className="ml-auto flex items-center gap-2 flex-1 max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
          }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies & shows..."
              className="w-full h-10 pl-9 pr-3 rounded-full bg-secondary/60 border border-border/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
