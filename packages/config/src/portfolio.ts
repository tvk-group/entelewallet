import type { WatchlistCatalogItem, WatchlistEntry } from '@entelewallet/types';

/** Default watchlist per product spec: SUI, ADA, MNT, BlockDAG */
export const DEFAULT_WATCHLIST_SYMBOLS = ['SUI', 'ADA', 'MNT', 'BDAG'] as const;

export const WATCHLIST_CATALOG: WatchlistCatalogItem[] = [
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui',
    networkId: 'sui',
    coingeckoId: 'sui',
    logo: '/icons/chains/sui.svg',
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    networkId: 'cardano',
    coingeckoId: 'cardano',
    logo: '/icons/chains/cardano.svg',
  },
  {
    id: 'mnt',
    symbol: 'MNT',
    name: 'Mantle',
    networkId: 'mantle',
    coingeckoId: 'mantle',
    logo: '/icons/chains/mantle.svg',
  },
  {
    id: 'bdag',
    symbol: 'BDAG',
    name: 'BlockDAG',
    networkId: 'blockdag',
    coingeckoId: 'blockdag',
    logo: '/icons/chains/blockdag.svg',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    networkId: 'bitcoin',
    coingeckoId: 'bitcoin',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    networkId: 'ethereum',
    coingeckoId: 'ethereum',
    logo: '/icons/chains/ethereum.svg',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    networkId: 'solana',
    coingeckoId: 'solana',
  },
];

export const DEFAULT_WATCHLIST_ENTRIES: WatchlistEntry[] = DEFAULT_WATCHLIST_SYMBOLS.map(
  (symbol) => {
    const item = WATCHLIST_CATALOG.find((c) => c.symbol === symbol)!;
    return {
      symbol: item.symbol,
      networkId: item.networkId,
      coingeckoId: item.coingeckoId,
      catalogId: item.id,
    };
  },
);

export const DEFAULT_PORTFOLIO_PREFERENCES = {
  displayMode: 'holdings-first' as const,
  networkViewId: 'entelekron',
  chainId: 1,
  autoDiscoverEnabled: false,
};

export function getWatchlistCatalogItem(symbol: string): WatchlistCatalogItem | undefined {
  return WATCHLIST_CATALOG.find((item) => item.symbol.toUpperCase() === symbol.toUpperCase());
}
