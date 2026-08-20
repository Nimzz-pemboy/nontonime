const STORAGE_KEY = "nonton-subs-v1";

export interface SubscriptionItem {
  animeId: string;
  animeTitle: string;
  subscribedAt: number;
}

export function readSubscriptions(): SubscriptionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SubscriptionItem[];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.subscribedAt - a.subscribedAt) : [];
  } catch {
    return [];
  }
}

function write(items: SubscriptionItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("subs-updated"));
}

export function isSubscribed(animeId: string) {
  return readSubscriptions().some((item) => item.animeId === animeId);
}

export function addSubscription(animeId: string, animeTitle: string) {
  if (typeof window === "undefined") return;
  const items = readSubscriptions().filter((entry) => entry.animeId !== animeId);
  write([{ animeId, animeTitle, subscribedAt: Date.now() }, ...items]);
}

export function removeSubscription(animeId: string) {
  write(readSubscriptions().filter((entry) => entry.animeId !== animeId));
}
