export default function RootLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
        <p className="text-sm text-[hsl(var(--muted))]">Memuat...</p>
      </div>
    </div>
  );
}
