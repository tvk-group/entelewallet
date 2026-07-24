'use client';

import { cn } from '@entelewallet/utils';

interface EcosystemOrbitProps {
  items: string[];
  className?: string;
  compact?: boolean;
}

export function EcosystemOrbit({ items, className, compact }: EcosystemOrbitProps) {
  return (
    <div
      className={cn(
        'ecosystem-orbit-container relative isolate overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl',
        compact
          ? 'aspect-square w-full max-w-[280px]'
          : 'aspect-square w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[520px]',
        className,
      )}
      style={{ contain: 'paint' }}
      aria-hidden
    >
      {/* Mobile / narrow: compact stacked layout */}
      <ul className="flex h-full flex-wrap content-center justify-center gap-2 p-4 lg:hidden">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-sm sm:text-xs"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Desktop: orbit inside bounded box */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
        <div
          className="ecosystem-orbit relative mx-auto h-full w-full"
          style={{ '--orbit-radius': 'clamp(56px, 32%, 100px)' } as React.CSSProperties}
        >
          <div className="orbit-core">ENK</div>
          {items.map((item, i) => (
            <span key={item} className="orbit-node" style={{ '--i': i } as React.CSSProperties}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
