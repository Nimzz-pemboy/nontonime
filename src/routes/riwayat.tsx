import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearHistory, readHistory, removeHistory, type HistoryItem } from "@/lib/history";
import { SectionTitle } from "@/components/anime/StateViews";

export const Route = createFileRoute("/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Tontonan — Nontonime" },
      { name: "description", content: "Daftar episode anime yang pernah kamu tonton, tersimpan di perangkat ini." },
      { property: "og:title", content: "Riwayat Tontonan — Nontonime" },
      { property: "og:description", content: "Daftar episode anime yang pernah kamu tonton di perangkat ini." },
    ],
  }),
  component: HistoryPage,
});

function formatDate(value: number) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readHistory());
    sync();
    window.addEventListener("history-updated", sync);
    return () => window.removeEventListener("history-updated", sync);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Riwayat Tontonan" icon="fa-solid fa-clock-rotate-left" />
        {items.length > 0 ? (
          <button
            onClick={() => clearHistory()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-destructive transition-colors hover:border-destructive"
          >
            <i className="fa-solid fa-trash" />
            Hapus semua
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Riwayat hanya tersimpan di perangkat ini dan akan hilang jika cache atau data browser dibersihkan.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-14 text-center">
          <i className="fa-solid fa-film text-2xl text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Belum ada riwayat tontonan.</p>
          <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Mulai jelajahi anime
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.episodeId}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
            >
              <img src={item.poster} alt={item.animeTitle} className="h-20 w-14 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold text-card-foreground">{item.animeTitle}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.episodeTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.watchedAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/watch/$episodeId"
                  params={{ episodeId: item.episodeId }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <i className="fa-solid fa-play" />
                  Lanjutkan
                </Link>
                <button
                  onClick={() => removeHistory(item.episodeId)}
                  aria-label="Hapus riwayat"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
