const TMDB_BASE = "/api/tmdb";
export const IMG = (path: string | null | undefined, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.pathname + url.search);
  if (!res.ok) {
    let msg = `TMDB ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}


export type Media = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv" | "person";
  genre_ids?: number[];
};

export type MovieDetails = Media & {
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
};

export type TvDetails = Media & {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  tagline: string;
  seasons: { id: number; season_number: number; name: string; episode_count: number; poster_path: string | null }[];
};

export type Episode = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string;
};

export const tmdb = {
  trending: (window: "day" | "week" = "week") =>
    get<{ results: Media[] }>(`/trending/all/${window}`),
  trendingMovies: () => get<{ results: Media[] }>(`/trending/movie/week`),
  trendingTv: () => get<{ results: Media[] }>(`/trending/tv/week`),
  popularMovies: () => get<{ results: Media[] }>(`/movie/popular`),
  topMovies: () => get<{ results: Media[] }>(`/movie/top_rated`),
  nowPlaying: () => get<{ results: Media[] }>(`/movie/now_playing`),
  popularTv: () => get<{ results: Media[] }>(`/tv/popular`),
  topTv: () => get<{ results: Media[] }>(`/tv/top_rated`),
  movieDetails: (id: string | number) => get<MovieDetails>(`/movie/${id}`),
  tvDetails: (id: string | number) => get<TvDetails>(`/tv/${id}`),
  season: (id: string | number, season: number) =>
    get<{ episodes: Episode[]; name: string; overview: string }>(`/tv/${id}/season/${season}`),
  similar: (kind: "movie" | "tv", id: string | number) =>
    get<{ results: Media[] }>(`/${kind}/${id}/similar`),
  search: (query: string) =>
    get<{ results: Media[] }>(`/search/multi`, { query, include_adult: "false" }),
};
