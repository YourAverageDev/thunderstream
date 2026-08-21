// AniList anime data source (https://anilist.co) via its public GraphQL API,
// proxied through /api/anilist. Used for anime browsing/details instead of
// the unofficial, heavily rate-limited Jikan/MyAnimeList API.
export type AniListMedia = {
  id: number;
  title: { romaji: string; english: string | null; native: string | null };
  description: string | null;
  coverImage: { large: string; extraLarge: string };
  averageScore: number | null;
  seasonYear: number | null;
  episodes: number | null;
  genres: string[];
};

type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

const ENDPOINT = "/api/anilist";

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length) {
    throw new Error(json.errors?.[0]?.message || `AniList request failed (${res.status})`);
  }
  return json.data as T;
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge }
  averageScore
  seasonYear
  episodes
  genres
`;

function currentSeason(): { season: MediaSeason; seasonYear: number } {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const season: MediaSeason = month <= 1 || month === 11 ? "WINTER" : month <= 4 ? "SPRING" : month <= 7 ? "SUMMER" : "FALL";
  return { season, seasonYear: now.getFullYear() };
}

function mediaPage(sort: string) {
  return `query ($perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: ${sort}) { ${MEDIA_FIELDS} }
    }
  }`;
}

export const anilist = {
  trending: () =>
    gql<{ Page: { media: AniListMedia[] } }>(mediaPage("TRENDING_DESC"), { perPage: 18 }).then((d) => d.Page.media),

  top: () =>
    gql<{ Page: { media: AniListMedia[] } }>(mediaPage("SCORE_DESC"), { perPage: 18 }).then((d) => d.Page.media),

  season: () => {
    const { season, seasonYear } = currentSeason();
    return gql<{ Page: { media: AniListMedia[] } }>(
      `query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
        }
      }`,
      { season, seasonYear, perPage: 18 },
    ).then((d) => d.Page.media);
  },

  search: (q: string) =>
    gql<{ Page: { media: AniListMedia[] } }>(
      `query ($q: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(type: ANIME, search: $q) { ${MEDIA_FIELDS} }
        }
      }`,
      { q, perPage: 24 },
    ).then((d) => d.Page.media),

  details: (id: number | string) =>
    gql<{ Media: AniListMedia }>(
      `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`,
      { id: Number(id) },
    ).then((d) => d.Media),
};
