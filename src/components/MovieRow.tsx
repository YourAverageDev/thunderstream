import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import type { Media } from "@/lib/tmdb";

export function MovieRow({ title, items }: { title: string; items: Media[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 800, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="relative py-6 md:py-8">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl md:text-3xl tracking-wide">{title}</h2>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div ref={scroller} className="scroll-row flex gap-4 overflow-x-auto pb-4">
          {items.map((it) => (
            <MovieCard key={`${it.media_type ?? "x"}-${it.id}`} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}
