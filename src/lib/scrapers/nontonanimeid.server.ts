import type { ScrapedCard, ScrapedDetail, ScrapedEpisodePlayback } from "./types";

// Diadaptasi dari script scraper nontonanimeid.js yang sudah ada — dipakai sebagai
// sumber cadangan (mis. anime lama) kalau API utama tidak punya datanya.
const BASE = "https://s13.nontonanimeid.boats";
const UA_MOBILE =
  "Mozilla/5.0 (Linux; Android 10; M2006C3MG Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.181 Mobile Safari/537.36";
const UA_DESKTOP = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

async function fetchPage(url: string, desktop = false) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": desktop ? UA_DESKTOP : UA_MOBILE,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: BASE + "/",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function extractAnimeList(html: string): ScrapedCard[] {
  const anime: ScrapedCard[] = [];
  const regex =
    /<a href="(https:\/\/s13\.nontonanimeid\.boats\/anime\/[^"]+)"[\s\S]*?<img src="([^"]+)" alt="([^"]*)"[\s\S]*?data-title-default="([^"]*)"/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    anime.push({ title: m[4] || m[3] || "", originalUrl: m[1]!, thumbnail: m[2]! });
  }
  return anime;
}

export async function naidSearch(query: string): Promise<ScrapedCard[]> {
  const html = await fetchPage(`${BASE}/?s=${encodeURIComponent(query)}`);
  return extractAnimeList(html);
}

export async function naidDetail(url: string): Promise<ScrapedDetail> {
  const html = await fetchPage(url, true);

  const jsonLdMatch = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/.exec(html);
  let schema: Record<string, unknown> | null = null;
  if (jsonLdMatch) {
    try {
      schema = JSON.parse(jsonLdMatch[1]!);
    } catch {
      schema = null;
    }
  }
  const graph = (schema?.["@graph"] as Array<Record<string, unknown>> | undefined) ?? [];
  const series = graph.find((g) => g["@type"] === "TVSeries");

  const synopsisMatch = /<p>(.*?)<\/p>/s.exec(html);
  const synopsis = synopsisMatch ? synopsisMatch[1]!.replace(/<[^>]+>/g, "").trim() : "";

  const episodeList: { eps: number; originalUrl: string }[] = [];
  const epRegex = /<a href="(https:\/\/s13\.nontonanimeid\.boats\/[^"]*episode-(\d+)\/)"[^>]*>/gi;
  let em: RegExpExecArray | null;
  const seen = new Set<number>();
  while ((em = epRegex.exec(html)) !== null) {
    const eps = parseInt(em[2]!, 10);
    if (seen.has(eps)) continue;
    seen.add(eps);
    episodeList.push({ eps, originalUrl: em[1]! });
  }
  episodeList.sort((a, b) => a.eps - b.eps);

  const genre = (series?.["genre"] as string[] | undefined) ?? [];

  return {
    title: (series?.["name"] as string) || "",
    japanese: null,
    poster: (series?.["image"] as { url?: string } | undefined)?.url || "",
    synopsisParagraphs: synopsis ? [synopsis] : [],
    score: null,
    status: null,
    type: null,
    studios: (series?.["productionCompany"] as { name?: string } | undefined)?.name || null,
    aired: (series?.["startDate"] as string) || null,
    genres: genre,
    episodeList,
  };
}

export async function naidEpisode(url: string): Promise<ScrapedEpisodePlayback> {
  const html = await fetchPage(url, true);

  const iframeMatch =
    /<iframe[^>]+data-src="([^"]+)"/.exec(html) || /<iframe[^>]+src="([^"]+)"/.exec(html);
  const streamUrl = iframeMatch ? iframeMatch[1]!.replace(/&amp;/g, "&") : null;

  const downloads: string[] = [];
  const dlRegex = /href="(https:\/\/s2\.kotakanimeid\.link\/out\/[^"]+)"/g;
  let dm: RegExpExecArray | null;
  while ((dm = dlRegex.exec(html)) !== null) {
    downloads.push(dm[1]!.replace(/&amp;/g, "&"));
  }

  const titleMatch = /<meta property="og:title" content="([^"]+)"/.exec(html);
  const title = titleMatch ? titleMatch[1]!.trim() : "";

  const prevMatch = /<a[^>]*href="([^"]+)"[^>]*class="[^"]*prev[^"]*"/i.exec(html);
  const nextMatch = /<a[^>]*href="([^"]+)"[^>]*class="[^"]*next[^"]*"/i.exec(html);

  return {
    title,
    streamOptions: streamUrl ? [{ label: "Default", url: streamUrl }] : [],
    downloadLinks: [...new Set(downloads)].map((u) => ({ title: "Download", url: u })),
    prevEpisodeUrl: prevMatch ? prevMatch[1]! : null,
    nextEpisodeUrl: nextMatch ? nextMatch[1]! : null,
  };
}
