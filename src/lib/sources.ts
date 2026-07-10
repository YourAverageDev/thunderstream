// Additional data sources: TVMaze, Jikan (anime), OMDb
async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

export type TvMazeShow = {
  id: number;
  name: string;
  premiered: string | null;
  image: { medium: string; original: string } | null;
  summary: string | null;
  rating: { average: number | null };
  genres: string[];
};
export type TvMazeSearchItem = { show: TvMazeShow };
export type TvMazeSchedule = {
  id: number;
  name: string;
  airdate: string;
  airtime: string;
  season: number;
  number: number;
  show: TvMazeShow;
};

export const tvmaze = {
  search: (q: string) => getJson<TvMazeSearchItem[]>(`/api/tvmaze/search/shows?q=${encodeURIComponent(q)}`),
  show: (id: number | string) => getJson<TvMazeShow>(`/api/tvmaze/shows/${id}`),
  scheduleToday: (country = "US") => getJson<TvMazeSchedule[]>(`/api/tvmaze/schedule?country=${country}`),
};

export type AnimeItem = {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  score: number | null;
  year: number | null;
  episodes: number | null;
  images: { jpg: { image_url: string; large_image_url: string } };
  genres: { name: string }[];
};

export const jikan = {
  topAnime: () => getJson<{ data: AnimeItem[] }>(`/api/jikan/top/anime`),
  seasonNow: () => getJson<{ data: AnimeItem[] }>(`/api/jikan/seasons/now`),
  search: (q: string) => getJson<{ data: AnimeItem[] }>(`/api/jikan/anime?q=${encodeURIComponent(q)}&sfw=true`),
  details: (id: number | string) => getJson<{ data: AnimeItem }>(`/api/jikan/anime/${id}`),
};

export type OmdbInfo = {
  Title: string;
  Year: string;
  Rated: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Metascore: string;
  Response: "True" | "False";
  Error?: string;
};

export const omdb = {
  byImdbId: (imdbId: string) => getJson<OmdbInfo>(`/api/omdb?i=${encodeURIComponent(imdbId)}`),
  byTitle: (title: string, year?: string) =>
    getJson<OmdbInfo>(`/api/omdb?t=${encodeURIComponent(title)}${year ? `&y=${year}` : ""}`),
};
