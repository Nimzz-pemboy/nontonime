import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorState, LoadingState } from "@/components/anime/StateViews";
import { batchQuery } from "@/lib/queries";

export const Route = createFileRoute("/download/$batchId")({
  head: ({ params }) => {
    const name = params.batchId.replace(/-sub-indo$/, "").replace(/-/g, " ");
    return {
      meta: [
        { title: `Download Batch ${name} — Nontonime` },
        { name: "description", content: `Link batch download ${name} subtitle Indonesia per resolusi.` },
        { property: "og:title", content: `Download Batch ${name} — Nontonime` },
        { property: "og:description", content: `Link batch download ${name} subtitle Indonesia.` },
      ],
    };
  },
  component: BatchPage,
});

function BatchPage() {
  const { batchId } = Route.useParams();
  const { data, isPending, error, refetch } = useQuery(batchQuery(batchId));

  if (isPending) return <LoadingState label="Memuat data batch" />;
  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );

  const batch = data.data;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-start gap-4">
        <img src={batch.poster} alt={batch.title} className="w-28 rounded-lg border border-border object-cover" />
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{batch.title}</h1>
          <p className="text-sm text-muted-foreground">
            {[batch.type, batch.episodes ? `${batch.episodes} episode` : null, batch.duration]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {batch.animeId ? (
            <Link
              to="/anime/$animeId"
              params={{ animeId: batch.animeId }}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <i className="fa-solid fa-arrow-left" />
              Kembali ke detail anime
            </Link>
          ) : null}
        </div>
      </div>

      {batch.downloadUrl?.formats?.map((format) => (
        <section key={format.title} className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">{format.title}</h2>
          {format.qualities.map((quality) => (
            <div key={quality.title} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-card-foreground">{quality.title}</span>
                <span className="text-xs text-muted-foreground">{quality.size}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quality.urls.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-card-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
