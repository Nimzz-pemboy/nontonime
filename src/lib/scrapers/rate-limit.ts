import { getRequestHeader } from "@tanstack/react-start/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey() {
  const forwarded = getRequestHeader("x-forwarded-for") ?? "";
  return getRequestHeader("cf-connecting-ip") ?? forwarded.split(",")[0]?.trim() ?? "anonymous";
}

export function checkScrapeRateLimit() {
  const key = clientKey();
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    throw new Error("Terlalu banyak permintaan ke sumber cadangan. Coba lagi dalam satu menit.");
  }
}
