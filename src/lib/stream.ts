// ThunderMovies streaming provider (videasy.to embeds)
export const streamUrls = {
  movie: (id: string | number) => `https://player.videasy.to/movie/${id}`,
  tv: (id: string | number, season: number, episode: number) =>
    `https://player.videasy.to/tv/${id}/${season}/${episode}`,
};

export const PROVIDER_NAME = "ThunderMovies";
