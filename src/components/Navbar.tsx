import { Link, useNavigate } from "@tanstack/react-router";
import { Zap, Search, LogOut, Settings, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { usernameFromEmail } from "@/lib/auth";

export function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const username = user?.user_metadata?.username || usernameFromEmail(user?.email);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setMenuOpen(false);
    navigate({ to: "/search", search: { q: query } });
  }

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="mx-auto max-w-[1600px] px-3 md:px-8">
        {/* Row 1: logo + nav (desktop) + search (desktop) + auth + burger (mobile) */}
        <div className="flex h-16 items-center gap-3 md:gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}
            >
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
            </div>
            <span className="font-display text-xl md:text-2xl tracking-wider whitespace-nowrap">
              THUNDER<span className="text-gradient-thunder">MOVIES</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Home</Link>
            <Link to="/movies" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Movies</Link>
            <Link to="/tv" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>TV</Link>
            <Link to="/anime" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>Anime</Link>
          </nav>

          <form onSubmit={submitSearch} className="hidden md:flex ml-auto flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search movies & shows..."
                className="w-full h-10 pl-9 pr-3 rounded-full bg-secondary/60 border border-border/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </form>

          <div className="ml-auto md:ml-0 flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  {username}
                </span>
                <Link
                  to="/settings"
                  title="Account settings"
                  className="grid h-9 w-9 place-items-center rounded-full bg-secondary/60 border border-border/50 hover:bg-secondary"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="grid h-9 w-9 place-items-center rounded-full bg-secondary/60 border border-border/50 hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-full bg-secondary/60 border border-border/50"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Row 2 (mobile): search always visible */}
        <form onSubmit={submitSearch} className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies, shows, anime..."
              enterKeyHint="search"
              className="w-full h-11 pl-10 pr-20 rounded-full bg-secondary/70 border border-border/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
            >
              Go
            </button>
          </div>
        </form>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-3 flex flex-wrap gap-2">
            {[
              { to: "/", label: "Home" },
              { to: "/movies", label: "Movies" },
              { to: "/tv", label: "TV Shows" },
              { to: "/anime", label: "Anime" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-sm"
                activeProps={{ className: "bg-primary text-primary-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
