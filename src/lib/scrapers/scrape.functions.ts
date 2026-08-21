import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkScrapeRateLimit } from "./rate-limit";
import { decodeScrapedEpisodeId, decodeScrapedId } from "./id-codec";
import { naidDetail, naidEpisode, naidSearch } from "./nontonanimeid.server";
import { gamiDetail, gamiEpisode, gamiSearch } from "./nimegami.server";
import { toAnimeCardData, toAnimeDetail, toEpisodeDetail } from "./normalize";
import type { AnimeCardData, AnimeDetail, ApiEnvelope, EpisodeDetail } from "@/lib/anime-types";

const querySchema = z.object({ query: z.string().min(1).max(100) });
const idSchema = z.object({ id: z.string().min(1).max(2000) });

// Cari di kedua sumber cadangan sekaligus (best-effort — satu sumber gagal tidak
// menggagalkan yang lain), dipakai halaman Cari kalau API utama kosong.
export const scrapeSearch = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => querySchema.parse(data))
  .handler(async ({ data }): Promise<ApiEnvelope<{ animeList: AnimeCardData[] }>> => {
    checkScrapeRateLimit();

    const [naidResult, gamiResult] = await Promise.allSettled([
      naidSearch(data.query),
      gamiSearch(data.query),
    ]);

    const animeList: AnimeCardData[] = [
      ...(naidResult.status === "fulfilled" ? naidResult.value.map((c) => toAnimeCardData("naid", c)) : []),
      ...(gamiResult.status === "fulfilled" ? gamiResult.value.map((c) => toAnimeCardData("gami", c)) : []),
    ];

    return { ok: true, data: { animeList } };
  });

export const scrapeAnimeDetail = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }): Promise<ApiEnvelope<AnimeDetail>> => {
    checkScrapeRateLimit();

    const decoded = decodeScrapedId(data.id);
    if (!decoded) throw new Error("ID sumber cadangan tidak valid.");

    const detail =
      decoded.source === "naid" ? await naidDetail(decoded.url) : await gamiDetail(decoded.url);

    if (!detail.title) throw new Error("Anime tidak ditemukan di sumber cadangan.");

    return { ok: true, data: toAnimeDetail(decoded.source, decoded.url, detail) };
  });

export const scrapeEpisode = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }): Promise<ApiEnvelope<EpisodeDetail>> => {
    checkScrapeRateLimit();

    const decoded = decodeScrapedEpisodeId(data.id);
    if (!decoded) throw new Error("ID episode sumber cadangan tidak valid.");

    const playback =
      decoded.source === "naid"
        ? await naidEpisode(decoded.episodeUrl)
        : await gamiEpisode(decoded.episodeUrl);

    return { ok: true, data: toEpisodeDetail(decoded.source, decoded.animeUrl, playback) };
  });
