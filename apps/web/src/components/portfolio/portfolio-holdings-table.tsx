'use client';

import { LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import type { PortfolioAsset } from '@entelewallet/types';
import { formatUsd } from '@/hooks/use-token-prices';
import { TokenLogo } from '@/components/token-logo';
import { Loader2 } from 'lucide-react';

interface PortfolioHoldingsTableProps {
  holdings: PortfolioAsset[];
  formatBalance: (asset: PortfolioAsset) => string | null;
  loading?: boolean;
}

export function PortfolioHoldingsTable({
  holdings,
  formatBalance,
  loading,
}: PortfolioHoldingsTableProps) {
  const t = useT();

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-slate-500">
        {t('portfolio.holdingsEmpty')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-2.5">{t('portfolio.colAsset')}</th>
            <th className="px-4 py-2.5">{t('portfolio.colNetwork')}</th>
            <th className="px-4 py-2.5 text-right">{t('portfolio.colPrice')}</th>
            <th className="px-4 py-2.5 text-right">{t('portfolio.colBalance')}</th>
            <th className="px-4 py-2.5 text-right">{t('portfolio.colValue')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {holdings.map((asset) => {
            const balance = formatBalance(asset);
            const priceLabel =
              asset.fiatQuotePolicy === 'none'
                ? t('assets.noMarketPrice')
                : formatUsd(asset.priceUsd) ?? '—';
            const valueLabel =
              asset.fiatQuotePolicy === 'none'
                ? '—'
                : formatUsd(asset.valueUsd) ?? '—';

            return (
              <tr key={asset.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                      <TokenLogo
                        symbol={asset.symbol}
                        name={asset.name}
                        logo={asset.logo}
                        coingeckoId={asset.coingeckoId}
                        size={32}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{asset.symbol}</p>
                      <p className="truncate text-xs text-slate-500">{asset.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {asset.network}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">{priceLabel}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                  {balance ? (
                    <>
                      <LtrSpan>{balance}</LtrSpan>
                      <span className="ml-1 text-xs text-slate-500">{asset.symbol}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                  {valueLabel}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
