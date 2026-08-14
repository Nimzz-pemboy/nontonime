import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimeGrid } from "@/components/anime/AnimeGrid";
import { Pagination } from "@/components/anime/Pagination";
import { ErrorState, LoadingState, SectionTitle } from "@/components/anime/StateViews";
import { genreAnimeQuery } from "@/lib/queries";

export const Route = createFileRoute("/genre/$genreId")({
  validateSearch: (search: Record<string, unknown>) => ({ page: Number(search['page'] ?? 1) || 1 }),
  head: ({ params }) => {
    const name = params.genreId.replace(/-/g, " ");
    return {
      meta: [
        { title: `Anime Genre ${name} — Nontonime` },
        { name: "description", content: `Kumpulan anime bergenre ${name} dengan subtitle Indonesia.` },
        { property: "og:title", content: `Anime Genre ${name} — Nontonime` },
        { property: "og:description", content: `Kumpulan anime bergenre ${name} subtitle Indonesia.` },
      ],
    };
  },
  component: GenreDetailPage,
});

function GenreDetailPage() {
  const { genreId } = Route.useParams();
  const { page } = Route.useSearch();
  const navigate = useNavigate();
  const { data, isPending, error, refetch } = useQuery(genreAnimeQuery(genreId, page));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <SectionTitle title={`Genre: ${genreId.replace(/-/g, " ")}`} icon="fa-solid fa-tag" />
      {isPending ? <LoadingState /> : null}
      {error ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
      {data ? (
        <>
          <AnimeGrid items={data.data.animeList} />
          <Pagination
            page={page}
            totalPages={data.pagination?.totalPages}
            hasNext={data.pagination?.hasNextPage}
            onChange={(next) => navigate({ to: "/genre/$genreId", params: { genreId }, search: { page: next } })}
          />
        </>
      ) : null}
    </div>
  );
}
