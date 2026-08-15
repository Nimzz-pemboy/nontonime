import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { episodeQuery } from "@/lib/queries";
import type { EpisodeListItem } from "@/lib/anime-types";

export function EpisodeDownloadButton({
  episode,
  batchId,
}: {
  episode: EpisodeListItem;
  batchId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError } = useQuery({ ...episodeQuery(episode.episodeId), enabled: open });
  const formats = data?.data.downloadUrl?.formats ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Download Episode ${episode.eps}`}
          className="shadow-brutal-press inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-card text-card-foreground shadow-brutal-sm"
        >
          <i className="fa-solid fa-download text-xs" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <p className="text-sm font-bold text-popover-foreground">Download Episode {episode.eps}</p>

        {isPending ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <i className="fa-solid fa-circle-notch fa-spin" />
            Memuat pilihan resolusi
          </p>
        ) : isError || formats.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Link download per-episode belum tersedia untuk episode ini. Coba unduh lewat batch.
            </p>
            {batchId ? (
              <Link
                to="/download/$batchId"
                params={{ batchId }}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                <i className="fa-solid fa-box-archive" />
                Buka batch download
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {formats.map((format) => (
              <div key={format.title} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {format.title}
                </p>
                {format.qualities.map((quality) => (
                  <div key={quality.title} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-popover-foreground">{quality.title}</span>
                    {quality.urls.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-2 border-foreground px-2 py-1 text-[11px] font-bold text-popover-foreground transition-colors hover:bg-accent"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
