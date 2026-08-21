import type { AnimeCardData, AnimeDetail, EpisodeDetail } from "@/lib/anime-types";
import {
  encodeDirectStream,
  encodeScrapedEpisodeId,
  encodeScrapedId,
  SOURCE_LABEL,
  type ScrapeSource,
} from "./id-codec";
import type { ScrapedCard, ScrapedDetail, ScrapedEpisodePlayback } from "./types";

export function toAnimeCardData(source: ScrapeSource, card: ScrapedCard): AnimeCardData {
  return {
    title: card.title,
    poster: card.thumbnail,
    animeId: encodeScrapedId(source, card.originalUrl),
    ...(card.status ? { status: card.status } : {}),
    ...(card.score ? { score: card.score } : {}),
    ...(card.episodesLabel ? { latestReleaseDate: card.episodesLabel } : {}),
    sourceLabel: SOURCE_LABEL[source],
  };
}

export function toAnimeDetail(source: ScrapeSource, animeUrl: string, detail: ScrapedDetail): AnimeDetail {
  return {
    title: detail.title,
    poster: detail.poster,
    japanese: detail.japanese ?? "",
    score: detail.score ?? "",
    producers: "",
    type: detail.type ?? "",
    status: detail.status ?? "",
    episodes: detail.episodeList.length || null,
    duration: "",
    aired: detail.aired ?? "",
    studios: detail.studios ?? "",
    batch: null,
    synopsis: { paragraphs: detail.synopsisParagraphs },
    genreList: detail.genres.map((title) => ({ title, genreId: title.toLowerCase().replace(/\s+/g, "-") })),
    episodeList: detail.episodeList.map((ep) => ({
      title: `Episode ${ep.eps}`,
      eps: ep.eps,
      ...(ep.date ? { date: ep.date } : {}),
      episodeId: encodeScrapedEpisodeId(source, ep.originalUrl, animeUrl),
    })),
    sourceLabel: SOURCE_LABEL[source],
  };
}

export function toEpisodeDetail(
  source: ScrapeSource,
  animeUrl: string,
  playback: ScrapedEpisodePlayback,
): EpisodeDetail {
  return {
    title: playback.title,
    animeId: encodeScrapedId(source, animeUrl),
    hasPrevEpisode: Boolean(playback.prevEpisodeUrl),
    prevEpisode: playback.prevEpisodeUrl
      ? { episodeId: encodeScrapedEpisodeId(source, playback.prevEpisodeUrl, animeUrl) }
      : null,
    hasNextEpisode: Boolean(playback.nextEpisodeUrl),
    nextEpisode: playback.nextEpisodeUrl
      ? { episodeId: encodeScrapedEpisodeId(source, playback.nextEpisodeUrl, animeUrl) }
      : null,
    server: {
      qualities: [
        {
          title: "Sumber Cadangan",
          serverList: playback.streamOptions.map((option) => ({
            title: option.label,
            serverId: encodeDirectStream(option.url),
          })),
        },
      ],
    },
    downloadUrl: playback.downloadLinks.length
      ? {
          formats: [
            {
              title: "Download",
              qualities: [
                {
                  title: "Tersedia",
                  size: "",
                  urls: playback.downloadLinks,
                },
              ],
            },
          ],
        }
      : null,
  };
}
