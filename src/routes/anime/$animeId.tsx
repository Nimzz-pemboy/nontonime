import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { EpisodeList } from "@/components/anime/EpisodeList";
import { ErrorState, LoadingState } from "@/components/anime/StateViews";
import { animeDetailQuery } from "@/lib/queries";
import { readHistory, type HistoryItem } from "@/lib/history";
import { cn } from "@/lib/utils";

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

function Pill({ icon, text }: { icon?: string; text: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1 text-xs font-bold text-card-foreground">
      {icon ? <i className={`${icon} text-primary`} /> : null}
      {text}
    </span>
  );
}

function Synopsis({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false);
  if (paragraphs.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-display text-xl font-semibold text-foreground">Sinopsis</h2>
      {expanded ? (
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{paragraphs.join(" ")}</p>
      )}
      <button
        onClick={() => setExpanded((value) => !value)}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? "Sembunyikan" : "Selengkapnya"}
        <i className={cn("fa-solid text-xs", expanded ? "fa-chevron-up" : "fa-chevron-down")} />
      </button>
    </section>
  );
}

function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false);
  // TODO: sambungkan ke API subscribe/notifikasi saat backend tersedia
  return (
    <button
      onClick={() => setSubscribed((value) => !value)}
      className={cn(
        "shadow-brutal-press inline-flex w-full items-center justify-center gap-2 border-2 border-foreground px-4 py-3 text-sm font-bold shadow-brutal-sm sm:w-auto",
        subscribed ? "bg-secondary text-secondary-foreground" : "bg-card text-card-foreground",
      )}
    >
      <i className={subscribed ? "fa-solid fa-bell" : "fa-regular fa-bell"} />
      {subscribed ? "Berlangganan" : "Subscribe"}
    </button>
  );
}

function AnimeDetailPage() {
  const { animeId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(animeDetailQuery(animeId));
  const [continueItem, setContinueItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setContinueItem(readHistory().find((item) => item.animeId === animeId) ?? null);
  }, [animeId]);

  if (isPending) return <LoadingState label="Memuat detail anime" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );

  const anime = data.data;
  const episodes = anime.episodeList ?? [];
  const firstEpisode = episodes.length
    ? episodes.reduce((earliest, episode) => (episode.eps < earliest.eps ? episode : earliest), episodes[0]!)
    : null;
  const continueEpisode = continueItem
    ? episodes.find((episode) => episode.episodeId === continueItem.episodeId)
    : undefined;
  const primaryTarget = continueEpisode ?? firstEpisode;
  const primaryLabel = continueEpisode
    ? `Lanjut Eps ${continueEpisode.eps}`
    : firstEpisode
      ? `Tonton Episode ${firstEpisode.eps}`
      : null;
  const isCompleted = /tamat|complete/i.test(anime.status ?? "");
  const batchId = anime.batch?.batchId ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-10 overflow-x-hidden px-4 pb-8">
      <div className="relative -mx-4 sm:mx-0 sm:overflow-hidden sm:border-2 sm:border-foreground">
        <div className="relative h-64 w-full overflow-hidden border-b-2 border-foreground sm:h-80">
          <img src={anime.poster} alt={anime.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          {anime.status ? (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1 text-xs font-bold text-foreground">
              <i className={cn("fa-solid text-primary", isCompleted ? "fa-circle-check" : "fa-tower-broadcast")} />
              {anime.status}
            </span>
          ) : null}
        </div>
        <div className="relative -mt-14 space-y-1 px-4 sm:-mt-16">
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-foreground drop-shadow-sm sm:text-4xl">
            {anime.title}
          </h1>
          {anime.japanese ? <p className="text-sm text-muted-foreground">{anime.japanese}</p> : null}
        </div>
      </div>

      <div className="space-y-6">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {anime.score ? <Pill icon="fa-solid fa-star" text={anime.score} /> : null}
          {anime.studios ? <Pill text={anime.studios} /> : null}
          {anime.aired ? <Pill text={anime.aired} /> : null}
          {anime.type ? <Pill text={anime.type} /> : null}
          {anime.episodes ? <Pill text={`${anime.episodes} episode`} /> : null}
          {anime.duration ? <Pill text={anime.duration} /> : null}
          {anime.views ? <Pill icon="fa-solid fa-eye" text={`${anime.views} views`} /> : null}
        </div>

        {anime.genreList?.length ? (
          <div className="flex flex-wrap gap-2">
            {anime.genreList.map((genre) => (
              <Link
                key={genre.genreId}
                to="/genre/$genreId"
                params={{ genreId: genre.genreId }}
                search={{ page: 1 }}
                className="border-2 border-foreground bg-card px-3 py-1 text-xs font-bold text-card-foreground transition-colors hover:bg-accent"
              >
                {genre.title}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {primaryTarget && primaryLabel ? (
            <Link
              to="/watch/$episodeId"
              params={{ episodeId: primaryTarget.episodeId }}
              className="shadow-brutal-press inline-flex w-full items-center justify-center gap-2 border-2 border-foreground bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-brutal-sm sm:w-auto"
            >
              <i className="fa-solid fa-play" />
              {primaryLabel}
            </Link>
          ) : null}
          <SubscribeButton />
        </div>

        {batchId ? (
          <Link
            to="/download/$batchId"
            params={{ batchId }}
            className="inline-flex items-center gap-2 border-2 border-foreground bg-accent px-3 py-2 text-sm font-bold text-accent-foreground"
          >
            <i className="fa-solid fa-box-archive" />
            Batch download (semua episode)
          </Link>
        ) : null}

        <Synopsis paragraphs={anime.synopsis?.paragraphs ?? []} />

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">Daftar Episode</h2>
          <EpisodeList episodes={episodes} batchId={batchId} />
        </section>

        {anime.recommendedAnimeList?.length ? (
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Rekomendasi</h2>
            <AnimeGrid items={anime.recommendedAnimeList} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
