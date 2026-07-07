import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { tmdb } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThunderMovies — Watch Movies & TV Shows Free Online" },
      { name: "description", content: "Stream trending movies and TV series in HD on ThunderMovies. No signup, no ads clutter — just pure cinema." },
      { property: "og:title", content: "ThunderMovies — Watch Movies & TV Shows Free Online" },
      { property: "og:description", content: "Stream trending movies and TV series in HD on ThunderMovies." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="h-[85vh]" />}>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function HomeContent() {
  const { data: trending, error } = useQuery({
    queryKey: ["trending"],
    queryFn: () => tmdb.trending("week"),
    retry: false,
  });

  if (error) {
    return (
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-2xl mx-auto text-center">
        <h1 className="font-display text-4xl mb-4">Setup Required</h1>
        <p className="text-muted-foreground mb-6">{(error as Error).message}</p>
        <ol className="text-left text-sm text-muted-foreground space-y-2 bg-card p-6 rounded-xl border border-border">
          <li>1. Get a free API key at <a className="text-primary underline" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">themoviedb.org/settings/api</a></li>
          <li>2. Add it as a project secret named <code className="text-primary">VITE_TMDB_API_KEY</code></li>
          <li>3. Reload — trending movies will appear here.</li>
        </ol>
      </div>
    );
  }

  if (!trending) {
    return <div className="pt-32 min-h-[80vh]" />;
  }

  const featured = trending.results.find((r) => r.backdrop_path) ?? trending.results[0];
  return (
    <>
      <Hero item={featured} />
      <div className="relative z-10 -mt-16">
        <TrendingRows />
      </div>
    </>
  );
}

function TrendingRows() {
  const { data: trendMovies } = useSuspenseQuery({ queryKey: ["tmovies"], queryFn: tmdb.trendingMovies });
  const { data: trendTv } = useSuspenseQuery({ queryKey: ["ttv"], queryFn: tmdb.trendingTv });
  const { data: popular } = useSuspenseQuery({ queryKey: ["popular"], queryFn: tmdb.popularMovies });
  const { data: nowPlaying } = useSuspenseQuery({ queryKey: ["now"], queryFn: tmdb.nowPlaying });
  const { data: top } = useSuspenseQuery({ queryKey: ["top"], queryFn: tmdb.topMovies });
  const { data: popTv } = useSuspenseQuery({ queryKey: ["popTv"], queryFn: tmdb.popularTv });

  return (
    <>
      <MovieRow title="Trending Movies" items={trendMovies.results} />
      <MovieRow title="Trending TV Shows" items={trendTv.results.map((r) => ({ ...r, media_type: "tv" as const }))} />
      <MovieRow title="Now Playing" items={nowPlaying.results} />
      <MovieRow title="Popular Movies" items={popular.results} />
      <MovieRow title="Popular Series" items={popTv.results.map((r) => ({ ...r, media_type: "tv" as const }))} />
      <MovieRow title="Top Rated" items={top.results} />
    </>
  );
}
