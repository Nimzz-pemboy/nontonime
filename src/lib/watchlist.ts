const STORAGE_KEY = "nonton-watchlist-v1";

export interface WatchlistItem {
  animeId: string;
  title: string;
  poster: string;
  addedAt: number;
}

export function readWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WatchlistItem[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.addedAt - a.addedAt) : [];
  } catch {
    return [];
  }
}

function write(items: WatchlistItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("watchlist-updated"));
}

export function isInWatchlist(animeId: string) {
  return readWatchlist().some((item) => item.animeId === animeId);
}

export function addToWatchlist(animeId: string, title: string, poster: string) {
  if (typeof window === "undefined") return;
  const items = readWatchlist().filter((entry) => entry.animeId !== animeId);
  write([{ animeId, title, poster, addedAt: Date.now() }, ...items]);
}

export function removeFromWatchlist(animeId: string) {
  write(readWatchlist().filter((entry) => entry.animeId !== animeId));
}

export function toggleWatchlist(animeId: string, title: string, poster: string) {
  if (isInWatchlist(animeId)) {
    removeFromWatchlist(animeId);
    return false;
  }
  addToWatchlist(animeId, title, poster);
  return true;
}
