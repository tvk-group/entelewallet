'use client';

import { getDisplayNetworkById } from '@entelewallet/config';
import { useT } from '@/lib/i18n-context';
import type { NetworkHoldingsBreakdown } from '@entelewallet/types';
import { formatUsd } from '@/hooks/use-token-prices';
import { ChainLogo } from '@/components/chain-logo';

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
      {breakdown.map((row) => {
        const network = getDisplayNetworkById(row.networkId);
        return (
          <li key={row.networkId} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <ChainLogo
                  icon={network?.icon}
                  networkId={row.networkId}
                  name={row.networkName}
                  size={32}
                />
              </div>
              <div className="min-w-0">
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
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums text-slate-900">
              {formatUsd(row.totalUsd) ?? '—'}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
