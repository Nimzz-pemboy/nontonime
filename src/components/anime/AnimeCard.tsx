import { Link } from "@tanstack/react-router";
import type { AnimeCardData } from "@/lib/anime-types";

export function AnimeCard({ anime }: { anime: AnimeCardData }) {
  const meta =
    anime.episodes != null
      ? `${anime.episodes} episode`
      : (anime.status ?? anime.releaseDay ?? "");

  return (
    <Link
      to="/anime/$animeId"
      params={{ animeId: anime.animeId }}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {anime.score ? (
          <span className="absolute left-2 top-2 rounded-md bg-background/85 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur">
            <i className="fa-solid fa-star mr-1 text-primary" />
            {anime.score}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground">
          {anime.title}
        </h3>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </Link>
  );
}
