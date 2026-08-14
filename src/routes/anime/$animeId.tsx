import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { ErrorState, LoadingState } from "@/components/anime/StateViews";
import { animeDetailQuery } from "@/lib/queries";

export const Route = createFileRoute("/anime/$animeId")({
  head: ({ params }) => {
    const name = params.animeId.replace(/-sub-indo$/, "").replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — Nontonime` },
        { name: "description", content: `Sinopsis, informasi, dan daftar episode ${name} subtitle Indonesia.` },
        { property: "og:title", content: `${name} — Nontonime` },
        { property: "og:description", content: `Sinopsis dan daftar episode ${name} subtitle Indonesia.` },
      ],
    };
  },
  component: AnimeDetailPage,
});

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function AnimeDetailPage() {
  const { animeId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(animeDetailQuery(animeId));

  if (isPending) return <LoadingState label="Memuat detail anime" />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState error={error} onRetry={() => refetch()} /></div>;

  const anime = data.data;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full max-w-[220px] rounded-xl border border-border object-cover"
        />
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {anime.title}
            </h1>
            {anime.japanese ? <p className="mt-1 text-sm text-muted-foreground">{anime.japanese}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genreList?.map((genre) => (
              <Link
                key={genre.genreId}
                to="/genre/$genreId"
                params={{ genreId: genre.genreId }}
                search={{ page: 1 }}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {genre.title}
              </Link>
            ))}
          </div>

          <div className="grid gap-1 sm:grid-cols-2">
            <InfoRow label="Skor" value={anime.score} />
            <InfoRow label="Status" value={anime.status} />
            <InfoRow label="Tipe" value={anime.type} />
            <InfoRow label="Episode" value={anime.episodes} />
            <InfoRow label="Durasi" value={anime.duration} />
            <InfoRow label="Rilis" value={anime.aired} />
            <InfoRow label="Studio" value={anime.studios} />
            <InfoRow label="Produser" value={anime.producers} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {anime.episodeList?.length ? (
              <Link
                to="/watch/$episodeId"
                params={{ episodeId: anime.episodeList[0]!.episodeId }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <i className="fa-solid fa-play" />
                Tonton episode terbaru
              </Link>
            ) : null}
            {anime.batch?.batchId ? (
              <Link
                to="/download/$batchId"
                params={{ batchId: anime.batch.batchId }}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:border-primary"
              >
                <i className="fa-solid fa-download" />
                Batch download
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {anime.synopsis?.paragraphs?.length ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Sinopsis</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {anime.synopsis.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Daftar Episode</h2>
        {anime.episodeList?.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {anime.episodeList.map((episode) => (
              <Link
                key={episode.episodeId}
                to="/watch/$episodeId"
                params={{ episodeId: episode.episodeId }}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
              >
                <span className="line-clamp-1 text-sm font-medium text-card-foreground">
                  Episode {episode.eps}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{episode.date}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada episode tersedia.</p>
        )}
      </section>

      {anime.recommendedAnimeList?.length ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Rekomendasi</h2>
          <AnimeGrid items={anime.recommendedAnimeList} />
        </section>
      ) : null}
    </div>
  );
}
