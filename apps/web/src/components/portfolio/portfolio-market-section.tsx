'use client';

import { LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import type { PortfolioAsset } from '@entelewallet/types';
import { formatUsd } from '@/hooks/use-token-prices';
import { TokenLogo } from '@/components/token-logo';

interface PortfolioMarketSectionProps {
  assets: PortfolioAsset[];
  formatBalance: (asset: PortfolioAsset) => string | null;
}

export function PortfolioMarketSection({ assets, formatBalance }: PortfolioMarketSectionProps) {
  const t = useT();

  if (assets.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-slate-500">{t('portfolio.marketEmpty')}</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {assets.map((asset) => {
        const balance = formatBalance(asset);
        const priceLabel = formatUsd(asset.priceUsd);

        return (
          <li key={asset.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              <TokenLogo
                symbol={asset.symbol}
                name={asset.name}
                logo={asset.logo}
                coingeckoId={asset.coingeckoId}
                size={36}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{asset.symbol}</p>
              <p className="truncate text-xs text-slate-500">{asset.network}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums text-slate-900">
                {priceLabel ?? '—'}
              </p>
              {balance && asset.hasBalance ? (
                <p className="text-xs tabular-nums text-slate-500">
                  <LtrSpan>{balance}</LtrSpan> {asset.symbol}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">{t('portfolio.noBalance')}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
