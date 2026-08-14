import type { AnimeCardData } from "@/lib/anime-types";
import { AnimeCard } from "./AnimeCard";

export function AnimeGrid({ items }: { items: AnimeCardData[] }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Tidak ada anime untuk ditampilkan.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((anime) => (
        <AnimeCard key={anime.animeId} anime={anime} />
      ))}
    </div>
  );
}
