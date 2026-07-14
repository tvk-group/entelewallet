'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DEFAULT_WATCHLIST_ENTRIES,
  getWatchlistCatalogItem,
  WATCHLIST_CATALOG,
} from '@entelewallet/config';
import type { WatchlistEntry, WatchlistResponse } from '@entelewallet/types';
import {
  readWatchlistSymbols,
  symbolsToWatchlistEntries,
  writeWatchlistSymbols,
} from '@/lib/watchlist-storage';
import { useTokenPrices } from '@/hooks/use-token-prices';
import type { TokenConfig } from '@entelewallet/types';

async function fetchWatchlistBff(): Promise<WatchlistResponse | null> {
  try {
    const res = await fetch('/api/user/watchlist', { credentials: 'include' });
    if (res.ok) return (await res.json()) as WatchlistResponse;
  } catch {
    /* ignore */
  }
  return null;
}

async function putWatchlistBff(symbols: string[]): Promise<void> {
  try {
    await fetch('/api/user/watchlist', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols }),
    });
  } catch {
    /* local fallback only */
  }
}

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
    queryFn: fetchWatchlistBff,
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

  const entries = useMemo(() => symbolsToWatchlistEntries(symbols), [symbols]);

  const priceTokens = useMemo(() => entriesToPriceTokens(entries), [entries]);
  const { prices, isLoading: pricesLoading } = useTokenPrices(priceTokens);

  const rows = useMemo(() => {
    return entries.map((entry) => {
      const catalog = getWatchlistCatalogItem(entry.symbol);
      const priceUsd = prices[entry.coingeckoId];
      return { entry, catalog, priceUsd };
    });
  }, [entries, prices]);

  const syncSymbols = useCallback(async (next: string[]) => {
    setSymbols(next);
    writeWatchlistSymbols(next);
    await putWatchlistBff(next);
  }, []);

  const addSymbol = useCallback(
    async (symbol: string) => {
      const upper = symbol.toUpperCase();
      if (symbols.includes(upper)) return;
      await syncSymbols([...symbols, upper]);
    },
    [symbols, syncSymbols],
  );

  const removeSymbol = useCallback(
    async (symbol: string) => {
      const upper = symbol.toUpperCase();
      const next = symbols.filter((s) => s !== upper);
      if (next.length === 0) return;
      await syncSymbols(next);
    },
    [symbols, syncSymbols],
  );

  const resetToDefault = useCallback(async () => {
    const defaults = DEFAULT_WATCHLIST_ENTRIES.map((e) => e.symbol);
    await syncSymbols(defaults);
  }, [syncSymbols]);

  return {
    symbols,
    entries,
    rows,
    catalog: WATCHLIST_CATALOG,
    pricesLoading,
    isApiSynced: apiQuery.isSuccess && !!apiQuery.data?.items?.length,
    addSymbol,
    removeSymbol,
    resetToDefault,
    refresh: () => apiQuery.refetch(),
  };
}
