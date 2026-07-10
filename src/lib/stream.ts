// Streaming embed providers for movies & TV
export type ProviderId = "videasy" | "vidsrc" | "vidsrccc" | "twoembed" | "superembed" | "autoembed";

export type Provider = {
  id: ProviderId;
  name: string;
  movie: (id: string | number) => string;
  tv: (id: string | number, season: number, episode: number) => string;
};

export const providers: Provider[] = [
  {
    id: "videasy",
    name: "ThunderStream",
    movie: (id) => `https://player.videasy.to/movie/${id}`,
    tv: (id, s, e) => `https://player.videasy.to/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "twoembed",
    name: "2Embed",
    movie: (id) => `https://www.2embed.cc/embed/${id}`,
    tv: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "superembed",
    name: "SuperEmbed",
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
];

const STORAGE_KEY = "thunder_provider";

export function getSavedProvider(): ProviderId {
  if (typeof window === "undefined") return providers[0].id;
  return (window.localStorage.getItem(STORAGE_KEY) as ProviderId) || providers[0].id;
}

export function saveProvider(id: ProviderId) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
}

export function getProvider(id: ProviderId): Provider {
  return providers.find((p) => p.id === id) || providers[0];
}

// Back-compat helpers (legacy imports)
export const PROVIDER_NAME = "ThunderStream";
export const streamUrls = {
  movie: providers[0].movie,
  tv: providers[0].tv,
};
