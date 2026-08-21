import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usernameFromEmail, updateAniListUsername, validateAniListUsername, signOut } from "@/lib/auth";
import { getTvModePreference, setTvModePreference, type TvModePreference } from "@/hooks/useTvMode";
import { getAutoplayPreference, setAutoplayPreference, clearAllPreferences } from "@/lib/prefs";
import { ProviderSelect, useProvider } from "@/components/ProviderSelect";
import { AnimeProviderSelect, useAnimeProviderPrefs } from "@/components/AnimeProviderSelect";
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

  const [provider, setProvider] = useProvider();
  const { provider: animeProvider, setProvider: setAnimeProvider, audio, setAudio } = useAnimeProviderPrefs();
  const [tvMode, setTvMode] = useState<TvModePreference>("auto");
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    setTvMode(getTvModePreference());
    setAutoplay(getAutoplayPreference());
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    setAniListInput(savedAniList);
  }, [savedAniList]);

  function onTvModeChange(next: TvModePreference) {
    setTvMode(next);
    setTvModePreference(next);
    window.location.reload();
  }

  function onAutoplayChange(enabled: boolean) {
    setAutoplay(enabled);
    setAutoplayPreference(enabled);
  }

  function onResetPreferences() {
    clearAllPreferences();
    window.location.reload();
  }

  async function onSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

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
      <main className="pt-28 pb-16 mx-auto max-w-2xl px-4 space-y-8">
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>

        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 space-y-6">
          <h2 className="text-sm font-semibold text-foreground">Account</h2>
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

          <button
            onClick={onSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">Playback</h2>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Autoplay</p>
              <p className="text-xs text-muted-foreground">Start playing as soon as a movie, show, or episode opens.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoplay}
              onClick={() => onAutoplayChange(!autoplay)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${autoplay ? "bg-primary" : "bg-secondary"}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-transform ${autoplay ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium mb-1.5">Default movie & TV source</p>
            <ProviderSelect value={provider} onChange={setProvider} />
          </div>

          <div>
            <p className="text-sm font-medium mb-1.5">Default anime source</p>
            <AnimeProviderSelect provider={animeProvider} audio={audio} onProviderChange={setAnimeProvider} onAudioChange={setAudio} />
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">TV / Fire TV</h2>
          <p className="text-xs text-muted-foreground">
            Controls the 10-foot, D-pad-friendly UI. Leave on Auto unless you're running this as a
            wrapped APK on a Fire TV Stick or Android TV device and it isn't detected correctly.
          </p>
          <div className="flex gap-2">
            {(["auto", "on", "off"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onTvModeChange(mode)}
                className={`flex-1 h-10 rounded-lg text-sm font-medium capitalize transition ${
                  tvMode === mode ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Reloads the page to apply.</p>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Reset</h2>
          <p className="text-xs text-muted-foreground">
            Clears saved source, autoplay, and TV mode preferences on this device. Your account isn't affected.
          </p>
          <button
            onClick={onResetPreferences}
            className="h-10 px-4 rounded-lg border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition"
          >
            Reset preferences
          </button>
        </section>

        <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Back home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
