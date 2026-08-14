import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState, SectionTitle } from "@/components/anime/StateViews";
import { scheduleQuery } from "@/lib/queries";

export const Route = createFileRoute("/jadwal")({
  head: () => ({
    meta: [
      { title: "Jadwal Rilis Anime Mingguan — Nontonime" },
      { name: "description", content: "Jadwal rilis anime setiap hari dalam seminggu, lengkap dengan poster." },
      { property: "og:title", content: "Jadwal Rilis Anime Mingguan — Nontonime" },
      { property: "og:description", content: "Jadwal rilis anime setiap hari dalam seminggu." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const { data, isPending, error, refetch } = useQuery(scheduleQuery());

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <SectionTitle title="Jadwal Rilis Mingguan" icon="fa-solid fa-calendar-days" />
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
      {data
        ? data.data.map((day) => (
            <section key={day.day} className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground">{day.day}</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {day.anime_list.map((anime) => (
                  <Link
                    key={anime.slug}
                    to="/anime/$animeId"
                    params={{ animeId: anime.slug }}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary"
                  >
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      loading="lazy"
                      className="h-16 w-12 shrink-0 rounded object-cover"
                    />
                    <span className="line-clamp-3 text-xs font-medium text-card-foreground">{anime.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        : null}
    </div>
  );
}
