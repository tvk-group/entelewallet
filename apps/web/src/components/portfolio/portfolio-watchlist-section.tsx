'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useWatchlist } from '@/hooks/use-watchlist';
import { formatUsd } from '@/hooks/use-token-prices';
import { Plus, X } from 'lucide-react';

export function PortfolioWatchlistSection() {
  const t = useT();
  const { symbols, rows, catalog, pricesLoading, addSymbol, removeSymbol } = useWatchlist();
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const symbol = draft.trim().toUpperCase();
    if (!symbol) return;
    const exists = catalog.some((item) => item.symbol === symbol);
    if (!exists) return;
    void addSymbol(symbol);
    setDraft('');
  };

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <p className="text-xs text-slate-500">{t('portfolio.watchlistHint')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {symbols.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => void removeSymbol(symbol)}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900 transition hover:bg-cyan-100"
            >
              {symbol}
              <X className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            placeholder={t('portfolio.watchlistAddPlaceholder')}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs uppercase outline-none focus:border-cyan-300"
            list="watchlist-catalog"
          />
          <datalist id="watchlist-catalog">
            {catalog.map((item) => (
              <option key={item.id} value={item.symbol} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-cyan-200"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('portfolio.watchlistAdd')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2.5">{t('portfolio.colAsset')}</th>
              <th className="px-4 py-2.5">{t('portfolio.colNetwork')}</th>
              <th className="px-4 py-2.5 text-right">{t('portfolio.colPrice')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ entry, catalog: item, priceUsd }) => (
              <tr key={entry.symbol} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item?.logo ? (
                      <Image
                        src={item.logo}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-contain ring-1 ring-slate-200"
                      />
                    ) : null}
                    <span className="font-semibold text-slate-900">{entry.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                  {item?.networkId ?? '—'}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right tabular-nums',
                    pricesLoading ? 'text-slate-400' : 'text-slate-900',
                  )}
                >
                  {pricesLoading ? t('assets.priceLoading') : formatUsd(priceUsd) ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
