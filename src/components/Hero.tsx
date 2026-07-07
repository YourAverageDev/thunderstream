import { Link } from "@tanstack/react-router";
import { Play, Info, Star } from "lucide-react";
import { IMG, type Media } from "@/lib/tmdb";

export function Hero({ item }: { item: Media }) {
  const kind: "movie" | "tv" = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const to = kind === "movie" ? "/movie/$id" : "/tv/$id";

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        {item.backdrop_path && (
          <img
            src={IMG(item.backdrop_path, "original")}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 hero-fade" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-[1600px] items-end px-4 md:px-8 pb-20 pt-32">
        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Featured Tonight
          </div>
          <h1 className="font-display text-5xl md:text-7xl leading-none tracking-wide">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {year && <span>{year}</span>}
            {item.vote_average > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {item.vote_average.toFixed(1)}
              </span>
            )}
            <span className="uppercase tracking-wider text-xs">{kind === "tv" ? "Series" : "Movie"}</span>
          </div>
          <p className="text-base md:text-lg text-muted-foreground line-clamp-3 max-w-xl">
            {item.overview}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={to}
              params={{ id: String(item.id) }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-primary-foreground transition hover:scale-105"
              style={{ background: "var(--gradient-thunder)", boxShadow: "var(--shadow-glow)" }}
            >
              <Play className="h-5 w-5" fill="currentColor" />
              Watch Now
            </Link>
            <Link
              to={to}
              params={{ id: String(item.id) }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 backdrop-blur px-6 py-3 font-semibold hover:bg-secondary transition"
            >
              <Info className="h-5 w-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
