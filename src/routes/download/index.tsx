import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionTitle } from "@/components/anime/StateViews";

export const Route = createFileRoute("/download/")({
  head: () => ({
    meta: [
      { title: "Download — Nontonime" },
      { name: "description", content: "Buka link download batch anime di Nontonime." },
      { property: "og:title", content: "Download — Nontonime" },
      { property: "og:description", content: "Link download batch anime di Nontonime." },
    ],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <SectionTitle title="Download" icon="fa-solid fa-download" />
      <div className="rounded-xl border border-border bg-card px-6 py-14 text-center">
        <i className="fa-solid fa-box-archive text-2xl text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Belum ada riwayat download di perangkat ini. Buka halaman detail anime, lalu pilih episode atau batch
          untuk mulai download.
        </p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Jelajahi anime
        </Link>
      </div>
    </div>
  );
}
