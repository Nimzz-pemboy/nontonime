import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { ErrorState, LoadingState, SectionTitle } from "@/components/anime/StateViews";
import { homeQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nontonime — Nonton Anime Subtitle Indonesia" },
      {
        name: "description",
        content:
          "Streaming anime ongoing dan tamat dengan subtitle Indonesia. Jadwal rilis, genre, dan riwayat tontonan tanpa perlu akun.",
      },
      { property: "og:title", content: "Nontonime — Nonton Anime Subtitle Indonesia" },
      {
        property: "og:description",
        content:
          "Streaming anime ongoing dan tamat dengan subtitle Indonesia. Jadwal rilis, genre, dan riwayat tontonan tanpa perlu akun.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data, isPending, error, refetch } = useQuery(homeQuery());

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <section className="relative overflow-hidden border-2 border-foreground bg-secondary p-8 shadow-brutal">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          {/* TODO: taruh file video kamu di public/hero-bg.mp4, source di bawah otomatis kepakai kalau filenya ada */}
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/75 to-background/50" />
        <div className="relative">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
            Nonton anime subtitle Indonesia
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Katalog anime ongoing dan tamat, jadwal rilis mingguan, serta riwayat tontonan yang
            tersimpan langsung di perangkat kamu. Tanpa akun, tanpa ribet.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ongoing"
              search={{ page: 1 }}
              className="shadow-brutal-press inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-brutal-sm"
            >
              <i className="fa-solid fa-tower-broadcast" />
              Anime Ongoing
            </Link>
            <Link
              to="/jadwal"
              className="shadow-brutal-press inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-brutal-sm"
            >
              <i className="fa-solid fa-calendar-days" />
              Jadwal Rilis
            </Link>
          </div>
        </div>
      </section>

      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}

      {data ? (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle title="Sedang Tayang" icon="fa-solid fa-tower-broadcast" />
              <Link to="/ongoing" search={{ page: 1 }} className="text-sm font-medium text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            <AnimeGrid items={data.data.ongoing?.animeList ?? []} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle title="Baru Tamat" icon="fa-solid fa-circle-check" />
              <Link to="/tamat" search={{ page: 1 }} className="text-sm font-medium text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            <AnimeGrid items={data.data.completed?.animeList ?? []} />
          </section>
        </>
      ) : null}
    </div>
  );
}
