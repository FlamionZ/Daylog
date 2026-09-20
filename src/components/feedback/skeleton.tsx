import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[hsl(var(--muted)/0.15)]',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton card for loading states in lists.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-4">
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

/**
 * Skeleton row for loading states in tables.
 */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-[hsl(var(--border))] px-4 py-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="ml-auto h-4 w-12" />
    </div>
  );
}
