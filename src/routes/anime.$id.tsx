import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { anilist } from "@/lib/anilist";
import { getAnimeStreamUrl, getNextAnimeProvider } from "@/lib/animeStream";
import { AnimeProviderSelect, useAnimeProviderPrefs } from "@/components/AnimeProviderSelect";
import { TvSelect } from "@/components/TvSelect";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StreamPlayer } from "@/components/StreamPlayer";
import { useIsTvMode } from "@/hooks/useTvMode";
import { ArrowLeft, Star, Calendar, Play } from "lucide-react";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetail,
});

const RELATION_ORDER = ["PREQUEL", "SEQUEL", "PARENT", "SIDE_STORY", "ALTERNATIVE"];

function AnimeDetail() {
  const { id } = Route.useParams();
  const isTvMode = useIsTvMode();
  const { provider, setProvider, audio, setAudio } = useAnimeProviderPrefs();
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [playingEpisode, setPlayingEpisode] = useState<number | null>(null);

  const { data: a, isLoading, error } = useQuery({
    queryKey: ["anilist", id],
    queryFn: () => anilist.details(id),
  });

  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center text-muted-foreground">Loading…</div></div>;
  if (error || !a) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center">Not found.</div></div>;

  const title = a.title.english || a.title.romaji;

  // AniList has no concept of "seasons" under one id — each season/part is
  // its own Media entry, linked via `relations`. Ongoing shows also often
  // have `episodes: null` until the run finishes, so fall back to how many
  // episodes have actually aired via `nextAiringEpisode`.
  const airedEpisodes = a.episodes ?? (a.nextAiringEpisode ? a.nextAiringEpisode.episode - 1 : null);
  const hasEpisodes = !!airedEpisodes && airedEpisodes > 0;

  const relatedSeasons = a.relations.edges
    .filter((r) => r.node.type === "ANIME" && RELATION_ORDER.includes(r.relationType))
    .sort((x, y) => RELATION_ORDER.indexOf(x.relationType) - RELATION_ORDER.indexOf(y.relationType));

  const streamUrl = playingEpisode !== null ? getAnimeStreamUrl(a.id, playingEpisode, provider, audio) : "";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16 max-w-[1200px] mx-auto px-4 md:px-8">
        <Link to="/anime" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Anime
        </Link>
        <div className="flex flex-col md:flex-row gap-8">
          <img src={a.coverImage.extraLarge || a.coverImage.large} alt={title}
            className="w-56 md:w-72 rounded-2xl shadow-2xl border border-border shrink-0" />
          <div className="space-y-4 flex-1">
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {a.averageScore != null && <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{(a.averageScore / 10).toFixed(1)}</span>}
              {a.seasonYear && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{a.seasonYear}</span>}
              {airedEpisodes != null && <span>{airedEpisodes}{a.episodes == null ? "+" : ""} episodes</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {a.genres.map((g) => <span key={g} className="text-xs bg-secondary/60 px-2.5 py-1 rounded-full">{g}</span>)}
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">{a.description}</p>

            {hasEpisodes ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Episode:</span>
                  <TvSelect
                    value={String(selectedEpisode)}
                    options={Array.from({ length: airedEpisodes as number }, (_, i) => i + 1).map((n) => ({
                      value: String(n),
                      label: `Episode ${n}`,
                    }))}
                    onChange={(value) => setSelectedEpisode(Number(value))}
                  />
                </div>
                <AnimeProviderSelect provider={provider} audio={audio} onProviderChange={setProvider} onAudioChange={setAudio} />
                <button
                  onClick={() => setPlayingEpisode(selectedEpisode)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-primary-foreground transition hover:scale-105"
                  style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}
                  autoFocus={isTvMode}
                  data-tv-primary="true"
                >
                  <Play className="h-4 w-4" fill="currentColor" /> Watch Now
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pt-2">
                {a.status === "NOT_YET_RELEASED" ? "Not yet released." : "No episodes available yet."}
              </p>
            )}
          </div>
        </div>

        {relatedSeasons.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl tracking-wide mb-4">More Seasons & Related</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedSeasons.map((r) => (
                <Link key={r.node.id} to="/anime/$id" params={{ id: String(r.node.id) }} className="group block">
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-secondary/40 border border-border/50">
                    <img src={r.node.coverImage.large} alt={r.node.title.english || r.node.title.romaji} loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">{r.relationType.replace("_", " ")}</p>
                  <p className="text-sm font-medium line-clamp-1">{r.node.title.english || r.node.title.romaji}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {playingEpisode !== null && (
        <StreamPlayer
          title={title}
          meta={`Episode ${playingEpisode}`}
          streamUrl={streamUrl}
          isTvMode={isTvMode}
          providerControl={<AnimeProviderSelect provider={provider} audio={audio} onProviderChange={setProvider} onAudioChange={setAudio} />}
          onNextSource={() => setProvider(getNextAnimeProvider(provider))}
          onClose={() => setPlayingEpisode(null)}
        />
      )}
    </div>
  );
}
