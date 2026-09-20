import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion
          className="mx-auto size-12 text-[hsl(var(--muted))]"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-xl font-semibold text-[hsl(var(--foreground))]">
          Halaman tidak ditemukan
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Halaman yang kamu cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:bg-[hsl(var(--primary)/0.9)]"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
