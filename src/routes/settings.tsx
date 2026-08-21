import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usernameFromEmail, updateAniListUsername, validateAniListUsername } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: "Settings — ThunderMovies" }],
  }),
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const username = user?.user_metadata?.username || usernameFromEmail(user?.email);
  const savedAniList = (user?.user_metadata?.anilist_username as string | undefined) || "";

  const [aniListInput, setAniListInput] = useState(savedAniList);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    setAniListInput(savedAniList);
  }, [savedAniList]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validateAniListUsername(aniListInput);
    if (validationError) return setError(validationError);
    setStatus("saving");
    try {
      const { error: updateError } = await updateAniListUsername(aniListInput);
      if (updateError) {
        setError(updateError.message);
        setStatus("idle");
        return;
      }
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-16 mx-auto max-w-lg px-4">
        <h1 className="font-display text-3xl tracking-wide mb-8">Account Settings</h1>

        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
            <p className="text-sm font-medium">{username}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">AniList username</label>
              <input
                value={aniListInput}
                onChange={(e) => setAniListInput(e.target.value)}
                placeholder="e.g. your AniList profile name"
                autoComplete="off"
                className="w-full h-11 px-3 rounded-lg bg-secondary/60 border border-border/60 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Just displays a link to your AniList profile — no account access is requested.
              </p>
            </div>

            {savedAniList && (
              <a
                href={`https://anilist.co/user/${encodeURIComponent(savedAniList)}/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View AniList profile
              </a>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-60"
            >
              {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save"}
            </button>
          </form>
        </div>

        <Link to="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
