import { getRequestHeader } from "@tanstack/react-start/server";

const BASE_URL = "https://www.sankavollerei.web.id/anime";

const ALLOWED: RegExp[] = [
  /^\/home$/,
  /^\/ongoing-anime\?page=\d{1,4}$/,
  /^\/complete-anime\?page=\d{1,4}$/,
  /^\/search\/[^/]{1,100}$/,
  /^\/genre$/,
  /^\/genre\/[a-z0-9-]{1,60}\?page=\d{1,4}$/,
  /^\/schedule$/,
  /^\/anime\/[A-Za-z0-9-_.]{1,120}$/,
  /^\/episode\/[A-Za-z0-9-_.]{1,120}$/,
  /^\/server\/[A-Za-z0-9-_.]{1,120}$/,
  /^\/batch\/[A-Za-z0-9-_.]{1,120}$/,
];

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey() {
  const forwarded = getRequestHeader("x-forwarded-for") ?? "";
  return (
    getRequestHeader("cf-connecting-ip") ??
    forwarded.split(",")[0]?.trim() ??
    "anonymous"
  );
}

function checkRateLimit() {
  const key = clientKey();
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    throw new Error("Terlalu banyak permintaan. Coba lagi dalam satu menit.");
  }
}

export async function requestUpstream(path: string) {
  if (!ALLOWED.some((pattern) => pattern.test(path))) {
    throw new Error("Permintaan tidak dikenali.");
  }
  checkRateLimit();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    throw new Error("Sumber data sedang tidak dapat dihubungi.");
  }

  if (!response.ok) {
    throw new Error("Sumber data sedang bermasalah. Coba lagi nanti.");
  }

  const json = (await response.json()) as { ok?: boolean; data?: unknown; message?: string };
  if (json.ok === false || json.data === undefined || json.data === null) {
    throw new Error(json.message?.trim() || "Data tidak ditemukan.");
  }
  return json;
}
