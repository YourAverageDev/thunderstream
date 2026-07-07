import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { tmdb } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["search", q],
    queryFn: () => tmdb.search(q!),
    enabled: !!q,
  });

  const results = (data?.results ?? []).filter((r) => r.media_type !== "person" && (r.poster_path || r.backdrop_path));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 mx-auto max-w-[1600px] px-4 md:px-8">
        <h1 className="font-display text-3xl md:text-5xl tracking-wide mb-2">
          {q ? <>Results for <span className="text-gradient-thunder">"{q}"</span></> : "Search"}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          {isLoading ? "Searching…" : `${results.length} title${results.length === 1 ? "" : "s"}`}
        </p>
        {!q && <p className="text-muted-foreground">Type a title in the search bar above.</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((r) => (
            <div key={`${r.media_type}-${r.id}`} className="w-full">
              <MovieCard item={r} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
