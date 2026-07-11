import { Link } from "@tanstack/react-router";
import { IMG, type Media } from "@/lib/tmdb";
import { Star, Play } from "lucide-react";

export function MovieCard({ item }: { item: Media }) {
  const kind: "movie" | "tv" = item.media_type === "tv" || item.first_air_date ? "tv" : "movie";
  const title = item.title || item.name || "Untitled";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const linkProps = kind === "movie"
    ? { to: "/movie/$id" as const, params: { id: String(item.id) } }
    : { to: "/tv/$id" as const, params: { id: String(item.id) } };

  return (
    <Link
      {...linkProps}
      className="group relative block w-[180px] md:w-[200px] shrink-0"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary">
        {item.poster_path ? (
          <img
            src={IMG(item.poster_path, "w500")}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <div className="flex items-center gap-2 text-xs">
            <div
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: "var(--gradient-thunder)" }}
            >
              <Play className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-medium">Watch now</span>
          </div>
        </div>
        {item.vote_average > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[11px] font-medium">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground">
          {year} · {kind === "tv" ? "Series" : "Movie"}
        </p>
      </div>
    </Link>
  );
}
