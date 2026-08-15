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
      className="group block border-2 border-foreground bg-card shadow-brutal-sm transition-transform hover:-translate-y-0.5 hover:shadow-brutal"
    >
      <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-foreground bg-muted">
        <img
          src={anime.poster}
          alt={anime.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {anime.score ? (
          <span className="absolute left-2 top-2 border-2 border-foreground bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            <i className="fa-solid fa-star mr-1" />
            {anime.score}
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-card-foreground">
          {anime.title}
        </h3>
        {meta ? <p className="text-xs font-medium text-muted-foreground">{meta}</p> : null}
      </div>
    </Link>
  );
}
