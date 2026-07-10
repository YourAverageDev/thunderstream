import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { tmdb, IMG } from "@/lib/tmdb";
import { getProvider } from "@/lib/stream";
import { ProviderSelect, useProvider } from "@/components/ProviderSelect";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Play, Star, Calendar, ArrowLeft, X } from "lucide-react";

export const Route = createFileRoute("/tv/$id")({
  component: TvPage,
});

function TvPage() {
  const { id } = Route.useParams();
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState<number | null>(null);
  const [providerId, setProviderId] = useProvider();

  const { data, isLoading, error } = useQuery({ queryKey: ["tv", id], queryFn: () => tmdb.tvDetails(id) });
  const { data: seasonData } = useQuery({
    queryKey: ["tv", id, "season", season],
    queryFn: () => tmdb.season(id, season),
    enabled: !!data,
  });

  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center text-muted-foreground">Loading…</div></div>;
  if (error || !data) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center">Show not found.</div></div>;

  const year = (data.first_air_date || "").slice(0, 4);
  const validSeasons = data.seasons.filter((s) => s.season_number > 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative min-h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          {data.backdrop_path && (
            <img src={IMG(data.backdrop_path, "original")} alt={data.name} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 hero-fade" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/20" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col md:flex-row gap-8 px-4 md:px-8 pt-28 pb-14">
          <Link to="/" className="absolute top-20 left-4 md:left-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {data.poster_path && (
            <img src={IMG(data.poster_path, "w500")} alt={data.name} className="w-56 md:w-72 rounded-2xl shadow-2xl border border-border shrink-0" />
          )}
          <div className="flex-1 space-y-5 pt-4">
            <h1 className="font-display text-5xl md:text-6xl leading-none tracking-wide">{data.name}</h1>
            {data.tagline && <p className="text-lg text-muted-foreground italic">"{data.tagline}"</p>}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {data.vote_average > 0 && (
                <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /><b>{data.vote_average.toFixed(1)}</b></span>
              )}
              {year && <span className="inline-flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4" />{year}</span>}
              <span className="text-muted-foreground">{data.number_of_seasons} Season{data.number_of_seasons !== 1 ? "s" : ""} · {data.number_of_episodes} Episodes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((g) => (
                <span key={g.id} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs">{g.name}</span>
              ))}
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">{data.overview}</p>
          </div>
        </div>
      </section>

      {/* Season / Episode picker */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl md:text-3xl tracking-wide">Episodes</h2>
          <select
            value={season}
            onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(null); }}
            className="h-10 px-4 rounded-full bg-secondary border border-border text-sm outline-none focus:border-primary"
          >
            {validSeasons.map((s) => (
              <option key={s.id} value={s.season_number}>
                Season {s.season_number}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3">
          {seasonData?.episodes.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setEpisode(ep.episode_number)}
              className="group flex flex-col md:flex-row gap-4 rounded-2xl border border-border bg-card/50 hover:bg-card p-3 text-left transition"
            >
              <div className="relative w-full md:w-56 aspect-video shrink-0 rounded-xl overflow-hidden bg-secondary">
                {ep.still_path ? (
                  <img src={IMG(ep.still_path, "w300")} alt={ep.name} className="h-full w-full object-cover group-hover:scale-105 transition" loading="lazy" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">No preview</div>
                )}
                <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                  <div className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "var(--gradient-thunder)" }}>
                    <Play className="h-5 w-5 text-primary-foreground" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl text-muted-foreground">{ep.episode_number}</span>
                  <h3 className="font-semibold group-hover:text-primary transition">{ep.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ep.overview || "No description available."}</p>
                <p className="text-xs text-muted-foreground mt-2">{ep.air_date} {ep.runtime ? `· ${ep.runtime}m` : ""}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Footer />

      {episode !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button onClick={() => setEpisode(null)} className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-secondary/80 hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
          <div className="w-full max-w-6xl space-y-3">
            <div className="text-sm text-muted-foreground">
              S{season} · E{episode} · <ProviderSelect value={providerId} onChange={setProviderId} />
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl bg-black">
              <iframe
                src={getProvider(providerId).tv(data.id, season, episode)}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                className="h-full w-full"
                title={`${data.name} S${season}E${episode}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
