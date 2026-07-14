import {
  DEFAULT_WATCHLIST_ENTRIES,
  DEFAULT_WATCHLIST_SYMBOLS,
  getWatchlistCatalogItem,
  WATCHLIST_CATALOG,
} from '@entelewallet/config';
import type { WatchlistEntry } from '@entelewallet/types';

const WATCHLIST_KEY = 'entelewallet-watchlist';

export function readWatchlistSymbols(): string[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_WATCHLIST_SYMBOLS];
  }

  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [...DEFAULT_WATCHLIST_SYMBOLS];
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_WATCHLIST_SYMBOLS];
    }
    return parsed.map((s) => s.toUpperCase());
  } catch {
    return [...DEFAULT_WATCHLIST_SYMBOLS];
  }
}

export function writeWatchlistSymbols(symbols: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols.map((s) => s.toUpperCase())));
}

export function symbolsToWatchlistEntries(symbols: string[]): WatchlistEntry[] {
  const entries: WatchlistEntry[] = [];
  for (const symbol of symbols) {
    const catalog = getWatchlistCatalogItem(symbol);
    if (!catalog) continue;
    entries.push({
      symbol: catalog.symbol,
      networkId: catalog.networkId,
      coingeckoId: catalog.coingeckoId,
      catalogId: catalog.id,
    });
  }
  return entries;
}

export function getDefaultWatchlistEntries(): WatchlistEntry[] {
  return DEFAULT_WATCHLIST_ENTRIES;
}

export function getWatchlistCatalog() {
  return WATCHLIST_CATALOG;
}
