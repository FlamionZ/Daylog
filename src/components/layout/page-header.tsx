import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-[#E2E8F0]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm font-semibold text-[#68645E] dark:text-[#8493A8]">
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:mt-0">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}
