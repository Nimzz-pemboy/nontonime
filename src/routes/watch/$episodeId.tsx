import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "@/components/anime/VideoPlayer";
import { EpisodeList } from "@/components/anime/EpisodeList";
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
  const episodes = anime.data?.data.episodeList ?? [];
  const batchId = anime.data?.data.batch?.batchId ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        <div className="space-y-6">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {data.title}
          </h1>

          {stream.error ? (
            <ErrorState error={stream.error} onRetry={() => stream.refetch()} />
          ) : (
            <VideoPlayer src={stream.data?.data.url ?? null} />
          )}

          <div className="space-y-4 border-2 border-foreground bg-card p-4 shadow-brutal-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kualitas</p>
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
                        ? "border-2 border-foreground bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
                        : "border-2 border-foreground bg-card px-3 py-1.5 text-sm font-bold text-card-foreground transition-colors hover:bg-accent"
                    }
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Server</p>
              <div className="flex flex-wrap gap-2">
                {activeServers.map((server) => (
                  <button
                    key={server.serverId}
                    onClick={() => setServerId(server.serverId)}
                    className={
                      server.serverId === serverId
                        ? "border-2 border-foreground bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground"
                        : "border-2 border-foreground bg-card px-3 py-1.5 text-sm font-bold text-card-foreground transition-colors hover:bg-accent"
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
                className="shadow-brutal-press inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-brutal-sm"
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
                className="shadow-brutal-press inline-flex items-center gap-2 border-2 border-foreground bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-brutal-sm"
              >
                <i className="fa-solid fa-list" />
                Semua episode
              </Link>
            ) : null}

            {data.hasNextEpisode && data.nextEpisode ? (
              <Link
                to="/watch/$episodeId"
                params={{ episodeId: data.nextEpisode.episodeId }}
                className="shadow-brutal-press inline-flex items-center gap-2 border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-brutal-sm"
              >
                Episode selanjutnya
                <i className="fa-solid fa-forward-step" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3 lg:mt-0">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground">Daftar Episode</h2>
          {anime.isPending ? (
            <p className="text-sm text-muted-foreground">Memuat daftar episode…</p>
          ) : (
            <div className="max-h-[32rem] overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
              <EpisodeList episodes={episodes} activeEpisodeId={episodeId} batchId={batchId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
