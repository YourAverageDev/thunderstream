import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { anilist } from "@/lib/anilist";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Star, Calendar } from "lucide-react";

export const Route = createFileRoute("/anime/$id")({
  component: AnimeDetail,
});

function AnimeDetail() {
  const { id } = Route.useParams();
  const { data: a, isLoading, error } = useQuery({
    queryKey: ["anilist", id],
    queryFn: () => anilist.details(id),
  });

  if (isLoading) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center text-muted-foreground">Loading…</div></div>;
  if (error || !a) return <div className="min-h-screen"><Navbar /><div className="pt-32 text-center">Not found.</div></div>;

  const title = a.title.english || a.title.romaji;

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
          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-5xl tracking-wider">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {a.averageScore != null && <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" />{(a.averageScore / 10).toFixed(1)}</span>}
              {a.seasonYear && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{a.seasonYear}</span>}
              {a.episodes && <span>{a.episodes} episodes</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {a.genres.map((g) => <span key={g} className="text-xs bg-secondary/60 px-2.5 py-1 rounded-full">{g}</span>)}
            </div>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">{a.description}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
