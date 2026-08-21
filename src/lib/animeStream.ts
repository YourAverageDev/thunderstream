// Streaming embed providers for anime, keyed by AniList ID + episode number.
// Separate from lib/stream.ts's movie/TV providers (TMDB-ID based) since
// anime embeds need a different id scheme and most movie/TV embed sites
// don't serve anime at all.
import { getAutoplayPreference } from "@/lib/prefs";

export type AnimeProviderId = "vidsrccc" | "vidnest" | "megaplay" | "vidplus";
export type AnimeAudio = "sub" | "dub";

export type AnimeProvider = {
  id: AnimeProviderId;
  name: string;
  embed: (anilistId: number | string, episode: number, audio: AnimeAudio) => string;
};

export const animeProviders: AnimeProvider[] = [
  {
    id: "vidsrccc",
    name: "VidSrc.cc",
    embed: (id, ep, audio) => `https://vidsrc.cc/v2/embed/anime/${id}/${ep}/${audio}`,
  },
  {
    id: "vidnest",
    name: "VidNest",
    embed: (id, ep, audio) => `https://vidnest.fun/anime/${id}/${ep}/${audio}`,
  },
  {
    id: "megaplay",
    name: "MegaPlay",
    embed: (id, ep, audio) => `https://megaplay.buzz/stream/ani/${id}/${ep}/${audio}`,
  },
  {
    id: "vidplus",
    name: "VidPlus",
    embed: (id, ep, audio) => `https://player.vidplus.to/embed/anime/${id}/${ep}?dub=${audio === "dub"}`,
  },
];

const PROVIDER_KEY = "thunder_anime_provider";
const AUDIO_KEY = "thunder_anime_audio";

function isAnimeProviderId(value: string | null): value is AnimeProviderId {
  return animeProviders.some((p) => p.id === value);
}

function isAnimeAudio(value: string | null): value is AnimeAudio {
  return value === "sub" || value === "dub";
}

function withPlaybackParams(url: string): string {
  if (!getAutoplayPreference()) return url;
  try {
    const next = new URL(url);
    next.searchParams.set("autoplay", "1");
    next.searchParams.set("autoPlay", "1");
    return next.toString();
  } catch {
    return url;
  }
}

export function getSavedAnimeProvider(): AnimeProviderId {
  if (typeof window === "undefined") return animeProviders[0].id;
  const saved = window.localStorage.getItem(PROVIDER_KEY);
  return isAnimeProviderId(saved) ? saved : animeProviders[0].id;
}

export function saveAnimeProvider(id: AnimeProviderId) {
  if (typeof window !== "undefined") window.localStorage.setItem(PROVIDER_KEY, id);
}

export function getAnimeProvider(id: AnimeProviderId): AnimeProvider {
  return animeProviders.find((p) => p.id === id) || animeProviders[0];
}

export function getNextAnimeProvider(id: AnimeProviderId): AnimeProviderId {
  const index = animeProviders.findIndex((p) => p.id === id);
  return animeProviders[(index + 1) % animeProviders.length].id;
}

export function getSavedAnimeAudio(): AnimeAudio {
  if (typeof window === "undefined") return "sub";
  const saved = window.localStorage.getItem(AUDIO_KEY);
  return isAnimeAudio(saved) ? saved : "sub";
}

export function saveAnimeAudio(audio: AnimeAudio) {
  if (typeof window !== "undefined") window.localStorage.setItem(AUDIO_KEY, audio);
}

export function getAnimeStreamUrl(
  anilistId: number | string,
  episode: number,
  providerId: AnimeProviderId,
  audio: AnimeAudio,
) {
  return withPlaybackParams(getAnimeProvider(providerId).embed(anilistId, episode, audio));
}
