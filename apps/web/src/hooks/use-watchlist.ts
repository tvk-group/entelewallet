'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DEFAULT_WATCHLIST_ENTRIES,
  getWatchlistCatalogItem,
  WATCHLIST_CATALOG,
} from '@entelewallet/config';
import type { WatchlistEntry } from '@entelewallet/types';
import { EntelekronApiError, fetchWatchlist, putWatchlist } from '@/lib/entelekron-api';
import {
  readWatchlistSymbols,
  symbolsToWatchlistEntries,
  writeWatchlistSymbols,
} from '@/lib/watchlist-storage';
import { useTokenPrices } from '@/hooks/use-token-prices';
import type { TokenConfig } from '@entelewallet/types';

function entriesToPriceTokens(entries: WatchlistEntry[]): TokenConfig[] {
  return entries.map((entry) => {
    const catalog = getWatchlistCatalogItem(entry.symbol);
    return {
      symbol: entry.symbol,
      name: catalog?.name ?? entry.symbol,
      decimals: 18,
      network: catalog?.networkId ?? '',
      chainId: 0,
      coingeckoId: entry.coingeckoId,
      enabled: true,
      logo: catalog?.logo,
    };
  });
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(() => readWatchlistSymbols());

  const apiQuery = useQuery({
    queryKey: ['entelekron-watchlist'],
    queryFn: () => fetchWatchlist(),
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (apiQuery.data?.items?.length) {
      const fromApi = apiQuery.data.items.map((item) => item.symbol);
      setSymbols(fromApi);
      writeWatchlistSymbols(fromApi);
    }
  }, [apiQuery.data]);

  const entries = useMemo(
    () => symbolsToWatchlistEntries(symbols),
    [symbols],
  );

  const priceTokens = useMemo(() => entriesToPriceTokens(entries), [entries]);
  const { prices, isLoading: pricesLoading } = useTokenPrices(priceTokens);

  const rows = useMemo(() => {
    return entries.map((entry) => {
      const catalog = getWatchlistCatalogItem(entry.symbol);
      const priceUsd = prices[entry.coingeckoId];
      return {
        entry,
        catalog,
        priceUsd,
      };
    });
  }, [entries, prices]);

  const addSymbol = useCallback(
    async (symbol: string) => {
      const upper = symbol.toUpperCase();
      if (symbols.includes(upper)) return;
      const next = [...symbols, upper];
      setSymbols(next);
      writeWatchlistSymbols(next);

      try {
        await putWatchlist(next);
      } catch (error) {
        if (!(error instanceof EntelekronApiError && error.status === 401)) {
          console.warn('[EnteleWALLET] watchlist sync failed', error);
        }
      }
    },
    [symbols],
  );

  const removeSymbol = useCallback(
    async (symbol: string) => {
      const upper = symbol.toUpperCase();
      const next = symbols.filter((s) => s !== upper);
      if (next.length === 0) return;
      setSymbols(next);
      writeWatchlistSymbols(next);

      try {
        await putWatchlist(next);
      } catch (error) {
        if (!(error instanceof EntelekronApiError && error.status === 401)) {
          console.warn('[EnteleWALLET] watchlist sync failed', error);
        }
      }
    },
    [symbols],
  );

  const resetToDefault = useCallback(async () => {
    const defaults = DEFAULT_WATCHLIST_ENTRIES.map((e) => e.symbol);
    setSymbols(defaults);
    writeWatchlistSymbols(defaults);
    try {
      await putWatchlist(defaults);
    } catch {
      /* local fallback */
    }
  }, []);

  return {
    symbols,
    entries,
    rows,
    catalog: WATCHLIST_CATALOG,
    pricesLoading,
    isApiSynced: apiQuery.isSuccess,
    addSymbol,
    removeSymbol,
    resetToDefault,
    refresh: () => apiQuery.refetch(),
  };
}
