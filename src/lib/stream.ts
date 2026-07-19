// Streaming embed providers for movies & TV
export type ProviderId = "vidlink" | "autoembed" | "vidsrc" | "vidsrccc" | "twoembed" | "superembed" | "videasy";

export type Provider = {
  id: ProviderId;
  name: string;
  movie: (id: string | number) => string;
  tv: (id: string | number, season: number, episode: number) => string;
};

export const providers: Provider[] = [
  {
    id: "vidlink",
    name: "VidLink",
    movie: (id) => `https://vidlink.pro/movie/${id}`,
    tv: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
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
    id: "superembed",
    name: "SuperEmbed",
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
];

const STORAGE_KEY = "thunder_provider";

const TV_SAFE_PROVIDERS: ProviderId[] = ["autoembed", "vidsrc", "vidsrccc", "vidlink", "twoembed", "superembed"];

const TV_FALLBACK_PROVIDER: ProviderId = TV_SAFE_PROVIDERS[0];

function isProviderId(value: string | null): value is ProviderId {
  return providers.some((provider) => provider.id === value);
}

function withPlaybackParams(url: string): string {
  try {
    const next = new URL(url);
    next.searchParams.set("autoplay", "1");
    next.searchParams.set("autoPlay", "1");
    return next.toString();
  } catch {
    return url;
  }
}

export function getSavedProvider(): ProviderId {
  if (typeof window === "undefined") return providers[0].id;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return isProviderId(saved) ? saved : providers[0].id;
}

export function saveProvider(id: ProviderId) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
}

export function getProvider(id: ProviderId): Provider {
  return providers.find((p) => p.id === id) || providers[0];
}

export function getTvSafeProvider(id: ProviderId): ProviderId {
  return TV_SAFE_PROVIDERS.includes(id) ? id : TV_FALLBACK_PROVIDER;
}

export function getNextTvProvider(id: ProviderId): ProviderId {
  const safeId = getTvSafeProvider(id);
  const index = TV_SAFE_PROVIDERS.indexOf(safeId);
  return TV_SAFE_PROVIDERS[(index + 1) % TV_SAFE_PROVIDERS.length];
}

export function getMovieStreamUrl(id: string | number, providerId: ProviderId, isTvMode = false) {
  const provider = getProvider(isTvMode ? getTvSafeProvider(providerId) : providerId);
  return withPlaybackParams(provider.movie(id));
}

export function getTvStreamUrl(id: string | number, season: number, episode: number, providerId: ProviderId, isTvMode = false) {
  const provider = getProvider(isTvMode ? getTvSafeProvider(providerId) : providerId);
  return withPlaybackParams(provider.tv(id, season, episode));
}

// Back-compat helpers (legacy imports)
export const PROVIDER_NAME = "ThunderStream";
export const streamUrls = {
  movie: getProvider("videasy").movie,
  tv: getProvider("videasy").tv,
};
