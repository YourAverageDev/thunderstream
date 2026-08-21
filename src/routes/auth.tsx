import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { signIn, signUp, validateUsername } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — ThunderMovies" },
      { name: "description", content: "Sign in or create your ThunderMovies account. No email required." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const uErr = validateUsername(username);
    if (uErr) return setError(uErr);
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const { error } = mode === "login" ? await signIn(username, password) : await signUp(username, password);
      if (error) {
        setError(error.message);
        return;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}>
            <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
          </div>
          <span className="font-display text-2xl tracking-wider">
            THUNDER<span className="text-gradient-thunder">MOVIES</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6">
          <div className="flex gap-2 mb-6 p-1 bg-secondary/60 rounded-lg">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Username</label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="thunder_fan"
                autoComplete="username"
                className="w-full h-11 px-3 rounded-lg bg-secondary/60 border border-border/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full h-11 px-3 rounded-lg bg-secondary/60 border border-border/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            No email needed — just pick a username.
          </p>
        </div>
      </div>
    </div>
  );
}
