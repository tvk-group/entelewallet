'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import { formatUsd } from '@/hooks/use-token-prices';
import { Search, Loader2 } from 'lucide-react';

interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  rank?: number;
  logo?: string;
}

async function searchMarkets(query: string): Promise<MarketCoin[]> {
  const res = await fetch(`/api/markets/search?q=${encodeURIComponent(query)}`);
  const data = (await res.json()) as { coins?: MarketCoin[] };
  return data.coins ?? [];
}

async function fetchSpotPrices(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {};
  const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids.join(','))}`);
  const data = (await res.json()) as { prices?: Record<string, number> };
  return data.prices ?? {};
}

export function CryptoMarketSearch() {
  const t = useT();
  const [query, setQuery] = useState('');

  const searchQuery = useQuery({
    queryKey: ['market-search', query],
    queryFn: () => searchMarkets(query),
    enabled: query.trim().length >= 2,
    staleTime: 120_000,
  });

  const coinIds = (searchQuery.data ?? []).map((c) => c.id);

  const pricesQuery = useQuery({
    queryKey: ['market-search-prices', coinIds.join(',')],
    queryFn: () => fetchSpotPrices(coinIds),
    enabled: coinIds.length > 0,
    staleTime: 60_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('markets.searchTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('markets.searchPlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {searchQuery.isFetching && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('common.loading')}
          </p>
        )}

        {searchQuery.data && searchQuery.data.length > 0 && (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {searchQuery.data.map((coin) => {
              const price = pricesQuery.data?.[coin.id];
              return (
                <li key={coin.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {coin.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coin.logo} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {coin.symbol.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{coin.name}</p>
                      <p className="text-xs text-slate-500">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {formatUsd(price) ?? '—'}
                    </p>
                    {coin.rank && (
                      <Badge variant="info" className="mt-1 text-[10px]">
                        #{coin.rank}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {query.trim().length >= 2 && !searchQuery.isFetching && searchQuery.data?.length === 0 && (
          <p className="text-sm text-slate-500">{t('markets.noResults')}</p>
        )}

        <p className="text-xs text-slate-500">{t('markets.poweredBy')}</p>
      </CardContent>
    </Card>
  );
}
