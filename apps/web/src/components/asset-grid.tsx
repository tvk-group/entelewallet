'use client';

import { useAccount } from 'wagmi';
import { AssetCard } from './asset-card';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { useT } from '@/lib/i18n-context';
import { Loader2 } from 'lucide-react';

export function AssetGrid() {
  const t = useT();
  const { isConnected } = useAccount();
  const {
    tokens,
    activeNetwork,
    nativeValue,
    erc20Balances,
    isInitialLoading,
    isRefreshing,
    hasError,
    refetch,
  } = usePortfolioBalances();

  if (!isConnected) return null;

  if (tokens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">{t('assets.noTokensForNetwork')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t('assets.tokens')}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {activeNetwork?.name ?? t('assets.network')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('assets.updating')}
            </span>
          )}
          <button
            type="button"
            onClick={refetch}
            disabled={isRefreshing}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-200 hover:text-cyan-800 disabled:opacity-60"
          >
            {t('assets.refresh')}
          </button>
        </div>
      </div>

      {hasError && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          {t('assets.balanceFetchWarning')}
        </div>
      )}

      <ul className="divide-y divide-slate-100">
        {tokens.map((token) => {
          const balance = token.isNative ? nativeValue : erc20Balances.get(token.symbol);

          return (
            <li key={`${token.chainId}-${token.symbol}${token.isNative ? '-native' : ''}`}>
              <AssetCard
                token={token}
                balance={balance}
                loading={isInitialLoading && balance === undefined}
                refreshing={isRefreshing && balance !== undefined}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
