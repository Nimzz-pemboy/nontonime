export function LoadingState({ label = "Memuat data" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
      <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary" />
      <p className="text-sm font-bold">{label}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof Error && error.message ? error.message : "Terjadi kesalahan saat mengambil data.";
  return (
    <div className="flex flex-col items-center gap-3 border-2 border-foreground bg-card px-6 py-14 text-center shadow-brutal">
      <i className="fa-solid fa-triangle-exclamation text-2xl text-destructive" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="shadow-brutal-press border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-brutal-sm"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function SectionTitle({ title, icon }: { title: string; icon: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-foreground">
      <i className={`${icon} text-primary`} />
      {title}
    </h2>
  );
}
