import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { tmdb, IMG } from "@/lib/tmdb";
import { getMovieStreamUrl, getTvSafeProvider, saveProvider } from "@/lib/stream";
import { ProviderSelect, useProvider } from "@/components/ProviderSelect";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useIsTvMode } from "@/hooks/useTvMode";
import { MovieRow } from "@/components/MovieRow";
import { StreamPlayer } from "@/components/StreamPlayer";
import { Play, Star, Clock, Calendar, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/movie/$id")({
  component: MoviePage,
});

function MoviePage() {
  const { id } = Route.useParams();
  const [playing, setPlaying] = useState(false);
  const [providerId, setProviderId] = useProvider();
  const isTvMode = useIsTvMode();

  const { data, isLoading, error } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => tmdb.movieDetails(id),
  });
  const { data: similar } = useQuery({
    queryKey: ["movie", id, "similar"],
    queryFn: () => tmdb.similar("movie", id),
  });

  useEffect(() => {
    if (!isTvMode) return;
    const safeProvider = getTvSafeProvider(providerId);
    if (safeProvider !== providerId) {
      saveProvider(safeProvider);
      setProviderId(safeProvider);
    }
  }, [isTvMode, providerId, setProviderId]);

  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center text-muted-foreground">Loading…</div></div>;
  if (error || !data)
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 text-center">Movie not found.</div>
      </div>
    );

  const year = (data.release_date || "").slice(0, 4);
  const hours = Math.floor((data.runtime || 0) / 60);
  const mins = (data.runtime || 0) % 60;
  const streamUrl = getMovieStreamUrl(data.id, providerId, isTvMode);

  function playMovie() {
    setPlaying(true);
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Backdrop */}
      <section className="relative min-h-[75vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          {data.backdrop_path && (
            <img src={IMG(data.backdrop_path, "original")} alt={data.title} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 hero-fade" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background/20" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col md:flex-row gap-8 px-4 md:px-8 pt-28 pb-16">
          <Link to="/" className="absolute top-20 left-4 md:left-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {data.poster_path && (
            <img
              src={IMG(data.poster_path, "w500")}
              alt={data.title}
              className="w-56 md:w-72 rounded-2xl shadow-2xl border border-border shrink-0"
            />
          )}
          <div className="flex-1 space-y-5 pt-4">
            <div>
              <h1 className="font-display text-5xl md:text-6xl leading-none tracking-wide">{data.title}</h1>
              {data.tagline && <p className="mt-2 text-lg text-muted-foreground italic">"{data.tagline}"</p>}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {data.vote_average > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <b>{data.vote_average.toFixed(1)}</b>
                </span>
              )}
              {year && <span className="inline-flex items-center gap-1 text-muted-foreground"><Calendar className="h-4 w-4" /> {year}</span>}
              {data.runtime > 0 && <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> {hours}h {mins}m</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((g) => (
                <span key={g.id} className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs">{g.name}</span>
              ))}
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">{data.overview}</p>
            <button
              onClick={playMovie}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-primary-foreground transition hover:scale-105"
              style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}
              autoFocus={isTvMode}
              data-tv-primary="true"
            >
              <Play className="h-5 w-5" fill="currentColor" /> Play Movie
            </button>
            <div className="pt-1"><ProviderSelect value={providerId} onChange={setProviderId} /></div>
          </div>
        </div>
      </section>

      {similar && similar.results.length > 0 && (
        <MovieRow title="More Like This" items={similar.results} />
      )}

      <Footer />

      {playing && (
        <StreamPlayer
          title={data.title || "Movie"}
          streamUrl={streamUrl}
          providerId={providerId}
          isTvMode={isTvMode}
          onProviderChange={setProviderId}
          onClose={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
