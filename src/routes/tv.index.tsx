import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "TV Shows — ThunderMovies" },
      { name: "description", content: "Popular, trending and top rated TV series on ThunderMovies." },
    ],
  }),
  component: TvIndex,
});

function TvIndex() {
  const trending = useQuery({ queryKey: ["t-trend"], queryFn: tmdb.trendingTv });
  const popular = useQuery({ queryKey: ["t-pop"], queryFn: tmdb.popularTv });
  const top = useQuery({ queryKey: ["t-top"], queryFn: tmdb.topTv });

  const all = [
    ...(trending.data?.results ?? []),
    ...(popular.data?.results ?? []),
    ...(top.data?.results ?? []),
  ];
  const seen = new Set<number>();
  const unique = all.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 mx-auto max-w-[1600px] px-4 md:px-8">
        <h1 className="font-display text-4xl md:text-6xl tracking-wide mb-8">TV Shows</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {unique.map((r) => <MovieCard key={r.id} item={{ ...r, media_type: "tv" }} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}
