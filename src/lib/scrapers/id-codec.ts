export type ScrapeSource = "naid" | "gami";

function toBase64Url(input: string) {
  const base64 = btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (input.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}

// ID sumber cadangan dikemas jadi satu string ("naid__<url>" / "gami__<url>") supaya
// bisa lewat param /anime/$animeId dan /watch/$episodeId yang sudah ada tanpa nambah route baru.
export function encodeScrapedId(source: ScrapeSource, originalUrl: string) {
  return `${source}__${toBase64Url(originalUrl)}`;
}

export function decodeScrapedId(id: string): { source: ScrapeSource; url: string } | null {
  const match = /^(naid|gami)__(.+)$/.exec(id);
  if (!match) return null;
  try {
    return { source: match[1] as ScrapeSource, url: fromBase64Url(match[2]!) };
  } catch {
    return null;
  }
}

export function isScrapedId(id: string) {
  return /^(naid|gami)__/.test(id);
}

// Episode ID perlu bawa URL anime induknya juga (dipakai watch page buat daftar
// episode & tombol "semua episode") — dikemas sebagai JSON kecil, bukan cuma satu URL.
export function encodeScrapedEpisodeId(source: ScrapeSource, episodeUrl: string, animeUrl: string) {
  const payload = JSON.stringify({ e: episodeUrl, a: animeUrl });
  return `${source}__${toBase64Url(payload)}`;
}

export function decodeScrapedEpisodeId(
  id: string,
): { source: ScrapeSource; episodeUrl: string; animeUrl: string } | null {
  const match = /^(naid|gami)__(.+)$/.exec(id);
  if (!match) return null;
  try {
    const payload = JSON.parse(fromBase64Url(match[2]!)) as { e: string; a: string };
    return { source: match[1] as ScrapeSource, episodeUrl: payload.e, animeUrl: payload.a };
  } catch {
    return null;
  }
}

// Dipakai buat "serverId" episode dari sumber cadangan: link streaming-nya sudah didapat
// langsung sewaktu scrape detail, jadi tidak perlu resolve dua langkah seperti API utama.
export function encodeDirectStream(url: string) {
  return `direct__${toBase64Url(url)}`;
}

export function decodeDirectStream(serverId: string): string | null {
  if (!serverId.startsWith("direct__")) return null;
  try {
    return fromBase64Url(serverId.slice("direct__".length));
  } catch {
    return null;
  }
}

export const SOURCE_LABEL: Record<ScrapeSource, string> = {
  naid: "NontonAnimeID",
  gami: "Nimegami",
};
