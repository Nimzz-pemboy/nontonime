import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatViews(views: number | string) {
  const n = typeof views === "string" ? parseFloat(views.replace(/[^\d.]/g, "")) : views;
  if (!Number.isFinite(n)) return String(views);
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}Jt`;
  return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
