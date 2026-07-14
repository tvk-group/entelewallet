export type PortfolioDisplayMode = 'holdings-first' | 'all-market';

export type PortfolioAssetSource = 'configured' | 'discovered' | 'catalog';

export interface WalletPreferences {
  displayMode: PortfolioDisplayMode;
  networkViewId: string;
  chainId: number;
  autoDiscoverEnabled: boolean;
}

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  networkId: string;
  chainId?: number;
  contractAddress?: string;
  decimals: number;
  logo?: string;
  coingeckoId?: string;
  priceUsd?: number;
  balance?: string;
  valueUsd?: number;
  hasBalance: boolean;
  fiatQuotePolicy?: 'market' | 'none';
  source: PortfolioAssetSource;
  pendingOfficialConfiguration?: boolean;
}

export interface WatchlistEntry {
  symbol: string;
  networkId?: string;
  coingeckoId: string;
  catalogId?: string;
}

export interface WatchlistCatalogItem {
  id: string;
  symbol: string;
  name: string;
  networkId: string;
  coingeckoId: string;
  logo?: string;
}

export interface WatchlistResponse {
  items: WatchlistEntry[];
  catalog: WatchlistCatalogItem[];
}

export interface EcosystemAsset {
  symbol: 'ENK' | 'SOVRA' | 'ENM';
  name: string;
  balance?: string;
  valueUsd?: number;
  vestingLinked: boolean;
  lockupSummary?: string;
  logo?: string;
  pendingOfficialConfiguration?: boolean;
}

export interface PortfolioResponse {
  walletAddress: string;
  preferences: WalletPreferences;
  holdings: PortfolioAsset[];
  discovered?: PortfolioAsset[];
  marketCatalog: PortfolioAsset[];
  watchlist: WatchlistEntry[];
  ecosystem: EcosystemAsset[];
  syncedAt: string;
  /** Cross-chain totals (Phase C). */
  networkBreakdown?: NetworkHoldingsBreakdown[];
  crossChainTotalUsd?: number;
}

export interface NetworkHoldingsBreakdown {
  networkId: string;
  networkName: string;
  chainId?: number;
  totalUsd?: number;
  holdingCount: number;
  portfolioTier: 'full' | 'price-only';
}

export interface LinkedAddresses {
  sui?: string;
  cardano?: string;
}

export interface NonEvmBalance {
  networkId: 'sui' | 'cardano';
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
  valueUsd?: number;
}
