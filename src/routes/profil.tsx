import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/anime/ThemeToggle";
import { SectionTitle } from "@/components/anime/StateViews";
import { siteConfig } from "@/lib/site-config";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — Nontonime" },
      { name: "description", content: "Pengaturan tampilan dan informasi Nontonime." },
      { property: "og:title", content: "Profil — Nontonime" },
      { property: "og:description", content: "Pengaturan tampilan Nontonime." },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <SectionTitle title="Profil" icon="fa-solid fa-circle-user" />

      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-2xl text-secondary-foreground">
          <i className="fa-solid fa-circle-user" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">Tamu</p>
          <p className="text-xs text-muted-foreground">Belum ada sistem akun di {siteConfig.name}.</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <p className="text-sm font-medium text-card-foreground">Tema Tampilan</p>
          <p className="text-xs text-muted-foreground">Ganti antara mode terang dan gelap.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <Link to="/riwayat" className="flex items-center justify-between text-sm font-medium text-card-foreground">
          Riwayat Tontonan
          <i className="fa-solid fa-chevron-right text-xs text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
