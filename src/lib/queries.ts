import { queryOptions } from "@tanstack/react-query";
import { fetchAnimeApi } from "./anime.functions";
import { scrapeAnimeDetail, scrapeEpisode, scrapeSearch } from "./scrapers/scrape.functions";
import { decodeDirectStream, isScrapedId } from "./scrapers/id-codec";
import type {
  AnimeDetail,
  AnimeListData,
  ApiEnvelope,
  BatchDetail,
  EpisodeDetail,
  Genre,
  HomeData,
  ScheduleDay,
} from "./anime-types";

async function get<T>(path: string) {
  return (await fetchAnimeApi({ data: { path } })) as unknown as ApiEnvelope<T>;
}

const common = { staleTime: 5 * 60 * 1000, retry: 1 };

export const homeQuery = () =>
  queryOptions({ queryKey: ["home"], queryFn: () => get<HomeData>("/home"), ...common });

export const ongoingQuery = (page: number) =>
  queryOptions({
    queryKey: ["ongoing", page],
    queryFn: () => get<AnimeListData>(`/ongoing-anime?page=${page}`),
    ...common,
  });

export const completedQuery = (page: number) =>
  queryOptions({
    queryKey: ["completed", page],
    queryFn: () => get<AnimeListData>(`/complete-anime?page=${page}`),
    ...common,
  });

export const searchQuery = (term: string) =>
  queryOptions({
    queryKey: ["search", term],
    queryFn: () => get<AnimeListData>(`/search/${encodeURIComponent(term)}`),
    enabled: term.trim().length > 0,
    ...common,
  });

// Sumber cadangan (scrape langsung) — dipakai halaman Cari saat API utama kosong,
// mis. buat anime lama yang tidak ada di database API utama.
export const fallbackSearchQuery = (term: string, enabled: boolean) =>
  queryOptions({
    queryKey: ["search-fallback", term],
    queryFn: () => scrapeSearch({ data: { query: term } }) as unknown as Promise<ApiEnvelope<AnimeListData>>,
    enabled: enabled && term.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

export const genreListQuery = () =>
  queryOptions({
    queryKey: ["genres"],
    queryFn: () => get<{ genreList: Genre[] }>("/genre"),
    ...common,
  });

export const genreAnimeQuery = (genreId: string, page: number) =>
  queryOptions({
    queryKey: ["genre", genreId, page],
    queryFn: () => get<AnimeListData>(`/genre/${genreId}?page=${page}`),
    ...common,
  });

export const scheduleQuery = () =>
  queryOptions({
    queryKey: ["schedule"],
    queryFn: () => get<ScheduleDay[]>("/schedule"),
    ...common,
  });

export const animeDetailQuery = (animeId: string) =>
  queryOptions({
    queryKey: ["anime", animeId],
    queryFn: () =>
      isScrapedId(animeId)
        ? (scrapeAnimeDetail({ data: { id: animeId } }) as unknown as Promise<ApiEnvelope<AnimeDetail>>)
        : get<AnimeDetail>(`/anime/${animeId}`),
    ...common,
  });

export const episodeQuery = (episodeId: string) =>
  queryOptions({
    queryKey: ["episode", episodeId],
    queryFn: () =>
      isScrapedId(episodeId)
        ? (scrapeEpisode({ data: { id: episodeId } }) as unknown as Promise<ApiEnvelope<EpisodeDetail>>)
        : get<EpisodeDetail>(`/episode/${episodeId}`),
    staleTime: 0,
    retry: 1,
  });

export const streamQuery = (serverId: string | null) =>
  queryOptions({
    queryKey: ["server", serverId],
    queryFn: async () => {
      const direct = serverId ? decodeDirectStream(serverId) : null;
      if (direct) return { ok: true, data: { url: direct } } as ApiEnvelope<{ url: string }>;
      return get<{ url: string }>(`/server/${serverId}`);
    },
    enabled: Boolean(serverId),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

export const batchQuery = (batchId: string) =>
  queryOptions({
    queryKey: ["batch", batchId],
    queryFn: () => get<BatchDetail>(`/batch/${batchId}`),
    ...common,
  });
