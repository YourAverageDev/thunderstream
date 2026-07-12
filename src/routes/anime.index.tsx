import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { jikan, type AnimeItem } from "@/lib/sources";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

export const Route = createFileRoute("/anime")({
  component: AnimePage,
  head: () => ({
    meta: [
      { title: "Anime — ThunderMovies" },
      { name: "description", content: "Discover top and seasonal anime from MyAnimeList." },
    ],
  }),
});

function AnimeCard({ a }: { a: AnimeItem }) {
  return (
    <Link to="/anime/$id" params={{ id: String(a.mal_id) }} className="group block">
      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-secondary/40 border border-border/50">
        <img src={a.images.jpg.large_image_url} alt={a.title} loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition" />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium line-clamp-1">{a.title_english || a.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {a.score && <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-primary text-primary" />{a.score}</span>}
          {a.year && <span>{a.year}</span>}
        </div>
      </div>
    </Link>
  );
}

function AnimePage() {
  const top = useQuery({ queryKey: ["anime", "top"], queryFn: () => jikan.topAnime() });
  const now = useQuery({ queryKey: ["anime", "now"], queryFn: () => jikan.seasonNow() });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16 max-w-[1600px] mx-auto px-4 md:px-8 space-y-12">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-6">This Season</h1>
          {now.isLoading ? <p className="text-muted-foreground">Loading…</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {now.data?.data.slice(0, 18).map((a) => <AnimeCard key={a.mal_id} a={a} />)}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-3xl tracking-wider mb-6">Top Anime</h2>
          {top.isLoading ? <p className="text-muted-foreground">Loading…</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {top.data?.data.slice(0, 18).map((a) => <AnimeCard key={a.mal_id} a={a} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
