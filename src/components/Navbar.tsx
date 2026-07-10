import { Link, useNavigate } from "@tanstack/react-router";
import { Zap, Search, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { usernameFromEmail } from "@/lib/auth";

export function Navbar() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { user } = useAuth();
  const username = user?.user_metadata?.username || usernameFromEmail(user?.email);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

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
          <Link to="/anime" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Anime
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

        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              {username}
            </span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary/60 border border-border/50 hover:bg-secondary transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
