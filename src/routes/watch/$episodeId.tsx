import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "@/components/anime/VideoPlayer";
import { ErrorState, LoadingState } from "@/components/anime/StateViews";
import { animeDetailQuery, episodeQuery, streamQuery } from "@/lib/queries";
import { saveHistory } from "@/lib/history";

export const Route = createFileRoute("/watch/$episodeId")({
  head: ({ params }) => {
    const name = params.episodeId.replace(/-sub-indo$/, "").replace(/-/g, " ");
    return {
      meta: [
        { title: `Nonton ${name} — Nontonime` },
        { name: "description", content: `Streaming ${name} subtitle Indonesia dengan pilihan kualitas dan server.` },
        { property: "og:title", content: `Nonton ${name} — Nontonime` },
        { property: "og:description", content: `Streaming ${name} subtitle Indonesia.` },
      ],
    };
  },
  component: WatchPage,
});

function WatchPage() {
  const { episodeId } = Route.useParams();
  const episode = useQuery(episodeQuery(episodeId));
  const [quality, setQuality] = useState<string | null>(null);
  const [serverId, setServerId] = useState<string | null>(null);

  const qualities = episode.data?.data.server?.qualities ?? [];

  useEffect(() => {
    setQuality(null);
    setServerId(null);
  }, [episodeId]);

  useEffect(() => {
    if (quality || qualities.length === 0) return;
    const preferred = qualities.find((item) => item.serverList.length > 0) ?? qualities[0];
    if (!preferred) return;
    setQuality(preferred.title);
    setServerId(preferred.serverList[0]?.serverId ?? null);
  }, [qualities, quality]);

  const activeServers = useMemo(
    () => qualities.find((item) => item.title === quality)?.serverList ?? [],
    [qualities, quality],
  );

  const stream = useQuery(streamQuery(serverId));
  const animeId = episode.data?.data.animeId ?? "";
  const anime = useQuery({ ...animeDetailQuery(animeId), enabled: Boolean(animeId) });

  useEffect(() => {
    if (!episode.data || !anime.data) return;
    saveHistory({
      episodeId,
      animeId: episode.data.data.animeId,
      animeTitle: anime.data.data.title,
      episodeTitle: episode.data.data.title,
      poster: anime.data.data.poster,
      watchedAt: Date.now(),
    });
  }, [episode.data, anime.data, episodeId]);

  if (episode.isPending) return <LoadingState label="Memuat episode" />;
  if (episode.error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={episode.error} onRetry={() => episode.refetch()} />
      </div>
    );

  const data = episode.data.data;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {data.title}
      </h1>

      {stream.error ? (
        <ErrorState error={stream.error} onRetry={() => stream.refetch()} />
      ) : (
        <VideoPlayer src={stream.data?.data.url ?? null} />
      )}

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kualitas</p>
          <div className="flex flex-wrap gap-2">
            {qualities.map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  setQuality(item.title);
                  setServerId(item.serverList[0]?.serverId ?? null);
                }}
                className={
                  item.title === quality
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                    : "rounded-md border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:border-primary"
                }
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Server</p>
          <div className="flex flex-wrap gap-2">
            {activeServers.map((server) => (
              <button
                key={server.serverId}
                onClick={() => setServerId(server.serverId)}
                className={
                  server.serverId === serverId
                    ? "rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground"
                    : "rounded-md border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:border-primary"
                }
              >
                {server.title.trim()}
              </button>
            ))}
            {activeServers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Server tidak tersedia untuk kualitas ini.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {data.hasPrevEpisode && data.prevEpisode ? (
          <Link
            to="/watch/$episodeId"
            params={{ episodeId: data.prevEpisode.episodeId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary"
          >
            <i className="fa-solid fa-backward-step" />
            Episode sebelumnya
          </Link>
        ) : (
          <span />
        )}

        {animeId ? (
          <Link
            to="/anime/$animeId"
            params={{ animeId }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:border-primary"
          >
            <i className="fa-solid fa-list" />
            Semua episode
          </Link>
        ) : null}

        {data.hasNextEpisode && data.nextEpisode ? (
          <Link
            to="/watch/$episodeId"
            params={{ episodeId: data.nextEpisode.episodeId }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Episode selanjutnya
            <i className="fa-solid fa-forward-step" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
