import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Empty state component with CTA.
 * Used when a list, dashboard section, or page has no data.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-[hsl(var(--muted))]" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[hsl(var(--muted))]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
