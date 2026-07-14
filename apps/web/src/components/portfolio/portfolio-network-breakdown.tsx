'use client';

import { useT } from '@/lib/i18n-context';
import type { NetworkHoldingsBreakdown } from '@entelewallet/types';
import { formatUsd } from '@/hooks/use-token-prices';

interface PortfolioNetworkBreakdownProps {
  breakdown: NetworkHoldingsBreakdown[];
}

export function PortfolioNetworkBreakdown({ breakdown }: PortfolioNetworkBreakdownProps) {
  const t = useT();

  if (breakdown.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-slate-500">{t('portfolio.breakdownEmpty')}</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {breakdown.map((row) => (
        <li key={row.networkId} className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.networkName}</p>
            <p className="text-xs text-slate-500">
              {row.holdingCount} {t('portfolio.holdingsLabel')}
              {row.portfolioTier === 'price-only' && (
                <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800">
                  {t('networks.priceOnly')}
                </span>
              )}
            </p>
          </div>
          <p className="text-sm font-medium tabular-nums text-slate-900">
            {formatUsd(row.totalUsd) ?? '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
