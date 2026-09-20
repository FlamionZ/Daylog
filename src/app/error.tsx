'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service (e.g., Sentry)
    // Do NOT log journal content or sensitive data
    console.error('Application error:', error.digest);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <AlertTriangle
          className="mx-auto size-12 text-[hsl(var(--warning))]"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-semibold text-[hsl(var(--foreground))]">
          Terjadi kesalahan
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Silakan coba lagi. Jika masalah berlanjut, muat ulang halaman.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
