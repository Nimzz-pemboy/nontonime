import { Link } from "@tanstack/react-router";
import { cn, formatViews } from "@/lib/utils";
import type { EpisodeListItem } from "@/lib/anime-types";
import { EpisodeDownloadButton } from "./EpisodeDownloadButton";

export function EpisodeList({
  episodes,
  activeEpisodeId,
  batchId,
}: {
  episodes: EpisodeListItem[];
  activeEpisodeId?: string;
  batchId?: string | null;
}) {
  if (episodes.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada episode tersedia.</p>;
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {episodes.map((episode) => {
        const isActive = episode.episodeId === activeEpisodeId;
        return (
          <li
            key={episode.episodeId}
            className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3", isActive && "bg-accent/60")}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="text-sm font-semibold text-card-foreground">Episode {episode.eps}</span>
              {episode.views ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <i className="fa-solid fa-eye" />
                  {formatViews(episode.views)}
                </span>
              ) : null}
            </div>

            {episode.date ? <span className="shrink-0 text-xs text-muted-foreground">{episode.date}</span> : null}

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/watch/$episodeId"
                params={{ episodeId: episode.episodeId }}
                className={cn(
                  "press-soft inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-card-foreground hover:bg-accent",
                )}
              >
                <i className="fa-solid fa-play text-[10px]" />
                {isActive ? "Ditonton" : "Tonton"}
              </Link>
              <EpisodeDownloadButton episode={episode} batchId={batchId} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
