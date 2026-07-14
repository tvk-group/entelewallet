export type ChainStatus = 'active' | 'testnet' | 'planned' | 'experimental';

export type UiCategory =
  | 'active'
  | 'testnet'
  | 'tvk-ecosystem'
  | 'coming-soon'
  | 'experimental';

export type RiskFlag = 'low' | 'medium' | 'high' | 'unverified';

export type TokenStandard = 'native' | 'ERC-20' | 'ERC-721' | 'ERC-1155';

export type ChainVerification = {
  rpcVerified: boolean;
  explorerVerified: boolean;
  signingTested: boolean;
  balanceDetectionTested: boolean;
  tokenDetectionTested: boolean;
};

export type PortfolioTier = 'full' | 'price-only';

export type ChainCapabilities = {
  watchOnly: boolean;
  walletConnect: boolean;
  transactions: boolean;
};


export type ChainDefinition = {
  id: string;
  chainId: number;
  name: string;
  shortName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  icon: string;
  status: ChainStatus;
  uiCategory: UiCategory;
  tokenStandards: TokenStandard[];
  riskFlag: RiskFlag;
  capabilities: ChainCapabilities;
  /** Portfolio balance support tier. Defaults to `full`. */
  portfolioTier?: PortfolioTier;
  verification: ChainVerification;
  notes?: string;
};

export type TvkModule = {
  id: string;
  name: string;
  type: 'ecosystem-module' | 'chain-integration';
  description: string;
  status: ChainStatus;
  uiCategory: 'tvk-ecosystem';
  icon: string;
  supportedChains: string[];
  riskFlag: RiskFlag;
  capabilities: ChainCapabilities;
  notes?: string;
};
