import type { ScrapedCard, ScrapedDetail, ScrapedEpisodePlayback } from "./types";

// Diadaptasi dari script scraper nimegami.js yang sudah ada — sumber cadangan kedua
// kalau API utama dan NontonAnimeID sama-sama tidak punya datanya.
const BASE = "https://nimegami.id";
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: BASE + "/",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const ENTITIES: Record<string, string> = {
  "&#038;": "&",
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8220;": '"',
  "&#8221;": '"',
  "&#8217;": "'",
  "&#039;": "'",
  "&amp;": "&",
  "&quot;": '"',
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};
function decodeEntities(str: string) {
  return str.replace(/&#?\w+;/g, (m) => ENTITIES[m] || m);
}

function extractArchiveAnime(html: string): ScrapedCard[] {
  const anime: ScrapedCard[] = [];
  const articleRegex = /<article>([\s\S]*?)<\/article>/gi;
  let am: RegExpExecArray | null;
  while ((am = articleRegex.exec(html)) !== null) {
    const article = am[1]!;
    const titleMatch = /<h2[^>]*>\s*<a href="([^"]+)"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>/.exec(article);
    if (!titleMatch) continue;
    const imgMatch = /<img[^>]*src="([^"]+)"[^>]*class="attachment-medium[^"]*"[^>]*alt="([^"]*)"/.exec(article);
    const ratingMatch = /<div class="rating-archive">[\s\S]*?<\/i>\s*([\d.]+)/.exec(article);
    const epsMatch = /<div class="eps-archive">Ep\.\s*(\d+)/.exec(article);
    const statusMatch = /<div class="term_tag-a">\s*<a[^>]*>\s*(Complete|On-Going|On-going)\s*<\/a>/i.exec(article);

    anime.push({
      title: decodeEntities(titleMatch[3]!.trim()),
      originalUrl: titleMatch[1]!,
      thumbnail: imgMatch ? imgMatch[1]! : "",
      score: ratingMatch ? ratingMatch[1]! : null,
      status: statusMatch ? statusMatch[1]! : null,
      episodesLabel: epsMatch ? `Ep. ${epsMatch[1]}` : null,
    });
  }
  return anime;
}

export async function gamiSearch(query: string): Promise<ScrapedCard[]> {
  const html = await fetchPage(`${BASE}/?s=${encodeURIComponent(query)}&post_type=post`);
  return extractArchiveAnime(html);
}

function decodeStreamData(encoded: string): { format: string; urls: string[] }[] {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(decoded) as { format: string; url: string[] }[];
    return data.map((item) => ({
      format: item.format,
      urls: item.url.map((u) => u.replace(/\\\//g, "/")),
    }));
  } catch {
    return [];
  }
}

export async function gamiDetail(url: string): Promise<ScrapedDetail> {
  const html = await fetchPage(url);

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
  const imageSchema = graph.find((g) => g["@type"] === "ImageObject");

  const titleMatch = /<h1[^>]*>([^<]+)<\/h1>/.exec(html);
  const title = titleMatch ? decodeEntities(titleMatch[1]!.trim()) : "";

  const titleJpMatch = /<div class="subheading"[^>]*><h2[^>]*>([^<]+)<\/h2>/.exec(html);
  const titleJp = titleJpMatch ? decodeEntities(titleJpMatch[1]!.trim()) : "";

  const thumbnail = (imageSchema?.["contentUrl"] as string) || (imageSchema?.["url"] as string) || "";

  const info: Record<string, string> = {};
  const tableRegex = /<td class="tablex">([^<]+?)\s*<span>.*?<\/span><\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
  let tm: RegExpExecArray | null;
  while ((tm = tableRegex.exec(html)) !== null) {
    const key = decodeEntities(tm[1]!.trim().toLowerCase());
    const value = decodeEntities(tm[2]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    info[key] = value;
  }

  const synopsisMatch = /<div class="content"[^>]*id="Sinopsis"[\s\S]*?<p>([\s\S]*?)<\/p>/.exec(html);
  const synopsis = synopsisMatch
    ? decodeEntities(synopsisMatch[1]!.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    : "";

  const genres: string[] = [];
  const catRegex = /<a href="https:\/\/nimegami\.id\/category\/[^"]+"[^>]*>([^<]+)<\/a>/gi;
  let cm: RegExpExecArray | null;
  while ((cm = catRegex.exec(html)) !== null) genres.push(decodeEntities(cm[1]!.trim()));

  const episodeList: { eps: number; originalUrl: string; title: string }[] = [];
  const epRegex = /<li class="select-eps" data="([^"]+)" id="play_eps_(\d+)" title="([^"]*)">([^<]+)<\/li>/gi;
  let em: RegExpExecArray | null;
  while ((em = epRegex.exec(html)) !== null) {
    episodeList.push({ eps: parseInt(em[2]!, 10), originalUrl: url, title: decodeEntities(em[4]!.trim()) });
  }

  return {
    title,
    japanese: titleJp || null,
    poster: thumbnail,
    synopsisParagraphs: synopsis ? [synopsis] : [],
    score: null,
    status: info["status"] || null,
    type: info["type"] || null,
    studios: info["studio"] || info["studios"] || null,
    aired: info["released"] || info["aired"] || null,
    genres: [...new Set(genres)],
    // Nimegami taruh semua episode di satu halaman (data stream ada di atribut "data"
    // per-<li>), jadi episodeUrl-nya sama dengan URL detail; nomor episode dibedakan
    // lewat query hash yang ditangani scrapeEpisode.
    episodeList: episodeList.map((e) => ({ eps: e.eps, originalUrl: `${url}#eps-${e.eps}` })),
  };
}

export async function gamiEpisode(urlWithHash: string): Promise<ScrapedEpisodePlayback> {
  const [url, hash] = urlWithHash.split("#eps-");
  const epsNumber = hash ? parseInt(hash, 10) : null;
  const html = await fetchPage(url!);

  const streamOptions: { label: string; url: string }[] = [];
  if (epsNumber !== null) {
    const liRegex = new RegExp(
      `<li class="select-eps" data="([^"]+)" id="play_eps_${epsNumber}" title="([^"]*)">`,
      "i",
    );
    const liMatch = liRegex.exec(html);
    if (liMatch) {
      const streams = decodeStreamData(liMatch[1]!);
      for (const s of streams) {
        s.urls.forEach((u, i) => streamOptions.push({ label: `${s.format} ${i + 1}`, url: u }));
      }
    }
  }

  const downloads: { title: string; url: string }[] = [];
  const dlRegex = /<li><strong>(\d+p)<\/strong>\s*((?:<a[^>]*>[^<]*<\/a>)+)<\/li>/gi;
  let dm: RegExpExecArray | null;
  while ((dm = dlRegex.exec(html)) !== null) {
    const quality = dm[1]!;
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let lm: RegExpExecArray | null;
    while ((lm = linkRegex.exec(dm[2]!)) !== null) {
      downloads.push({ title: `${quality} — ${lm[2]!.trim()}`, url: lm[1]!.replace(/&amp;/g, "&") });
    }
  }

  const titleMatch = /<h1[^>]*>([^<]+)<\/h1>/.exec(html);

  return {
    title: titleMatch ? decodeEntities(titleMatch[1]!.trim()) : "",
    streamOptions,
    downloadLinks: downloads,
    prevEpisodeUrl: epsNumber && epsNumber > 1 ? `${url}#eps-${epsNumber - 1}` : null,
    nextEpisodeUrl: epsNumber ? `${url}#eps-${epsNumber + 1}` : null,
  };
}
