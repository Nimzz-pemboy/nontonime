const STORAGE_KEY = "nonton-history-v1";

export interface HistoryItem {
  episodeId: string;
  animeId: string;
  animeTitle: string;
  episodeTitle: string;
  poster: string;
  watchedAt: number;
}

export function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.watchedAt - a.watchedAt) : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  window.dispatchEvent(new Event("history-updated"));
}

export function saveHistory(item: HistoryItem) {
  if (typeof window === "undefined") return;
  const items = readHistory().filter((entry) => entry.episodeId !== item.episodeId);
  write([item, ...items]);
}

export function removeHistory(episodeId: string) {
  write(readHistory().filter((entry) => entry.episodeId !== episodeId));
}

export function clearHistory() {
  write([]);
}
