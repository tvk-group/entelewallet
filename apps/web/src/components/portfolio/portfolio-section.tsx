'use client';

import { cn } from '@entelewallet/utils';
import type { ReactNode } from 'react';

interface PortfolioSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function PortfolioSection({
  title,
  description,
  children,
  className,
  action,
}: PortfolioSectionProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
