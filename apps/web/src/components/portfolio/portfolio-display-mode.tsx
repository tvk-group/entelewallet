'use client';

import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import type { PortfolioDisplayMode } from '@entelewallet/types';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PortfolioDisplayModeSelectProps {
  value: PortfolioDisplayMode;
  onChange: (mode: PortfolioDisplayMode) => void;
  className?: string;
  variant?: 'header' | 'inline';
}

const MODES: PortfolioDisplayMode[] = ['holdings-first', 'all-market'];

export function PortfolioDisplayModeSelect({
  value,
  onChange,
  className,
  variant = 'inline',
}: PortfolioDisplayModeSelectProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const isHeader = variant === 'header';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border transition',
          isHeader
            ? 'border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-cyan-50 hover:bg-white/15'
            : 'border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-cyan-200',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{t(`portfolio.displayMode.${value}`)}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            'absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg',
            isHeader ? 'right-0' : 'left-0',
          )}
        >
          {MODES.map((mode) => (
            <li key={mode}>
              <button
                type="button"
                role="option"
                aria-selected={mode === value}
                onClick={() => {
                  onChange(mode);
                  setOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-xs transition',
                  mode === value
                    ? 'bg-cyan-50 font-semibold text-cyan-900'
                    : 'text-slate-700 hover:bg-slate-50',
                )}
              >
                <span className="block font-medium">{t(`portfolio.displayMode.${mode}`)}</span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                  {t(`portfolio.displayModeHint.${mode}`)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
