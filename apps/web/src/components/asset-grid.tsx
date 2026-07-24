'use client';

import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { AssetCard } from './asset-card';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { getTokenUsdValue, useTokenPrices } from '@/hooks/use-token-prices';
import { useT } from '@/lib/i18n-context';
import { Loader2 } from 'lucide-react';
import type { TokenConfig } from '@entelewallet/types';

function tokenRowKey(token: TokenConfig) {
  return `${token.chainId}-${token.symbol}${token.contractAddress ?? '-native'}`;
}

export function AssetGrid() {
  const t = useT();
  const { isConnected } = useAccount();
  const [hideZero, setHideZero] = useState(true);
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

  const { prices, isLoading: pricesLoading } = useTokenPrices(tokens);

  const rows = useMemo(() => {
    return tokens.map((token) => {
      const balance = token.isNative ? nativeValue : erc20Balances.get(token.symbol);
      const fiatUsd = getTokenUsdValue(token, balance, prices);
      return { token, balance, fiatUsd, key: tokenRowKey(token) };
    });
  }, [tokens, nativeValue, erc20Balances, prices]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aVal = a.fiatUsd ?? 0;
      const bVal = b.fiatUsd ?? 0;
      if (bVal !== aVal) return bVal - aVal;
      if (a.token.symbol === 'ENK') return -1;
      if (b.token.symbol === 'ENK') return 1;
      return a.token.name.localeCompare(b.token.name);
    });
  }, [rows]);

  const visibleRows = useMemo(() => {
    if (!hideZero) return sortedRows;
    return sortedRows.filter(({ balance, token }) => {
      if (token.pendingOfficialConfiguration) return true;
      return balance !== undefined && balance > 0n;
    });
  }, [hideZero, sortedRows]);

  if (!isConnected) return null;

  if (tokens.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">{t('assets.noTokensForNetwork')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {t('assets.tokens')}
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {activeNetwork?.name ?? t('assets.network')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isRefreshing && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('assets.updating')}
            </span>
          )}
          <button
            type="button"
            onClick={() => setHideZero((v) => !v)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-cyan-200 hover:text-cyan-800"
          >
            {hideZero ? t('assets.showZero') : t('assets.hideZero')}
          </button>
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

      {visibleRows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          {t('assets.noVisibleTokens')}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visibleRows.map(({ token, balance, fiatUsd, key }) => (
            <li key={key}>
              <AssetCard
                token={token}
                balance={balance}
                fiatUsd={fiatUsd}
                loading={isInitialLoading && balance === undefined}
                refreshing={isRefreshing && balance !== undefined}
                pricesLoading={pricesLoading}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
