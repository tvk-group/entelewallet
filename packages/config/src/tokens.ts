import type { TokenConfig } from '@entelewallet/types';

const ENK_CONTRACT = '0xC95343B3f8A5af57a9b3B1acFf3D2a7654Fa28F6';

/** Central token registry — single source of truth for EnteleWALLET Lite. */
export const TOKEN_REGISTRY: TokenConfig[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
    network: 'Ethereum',
    chainId: 1,
    enabled: true,
    isNative: true,
    explorerUrl: 'https://etherscan.io',
  },
  {
    symbol: 'ENK',
    name: 'EnteleKRON',
    decimals: 18,
    network: 'Ethereum',
    chainId: 1,
    contractAddress: ENK_CONTRACT,
    enabled: true,
    pendingOfficialConfiguration: false,
    explorerUrl: `https://etherscan.io/token/${ENK_CONTRACT}`,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    network: 'Ethereum',
    chainId: 1,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    enabled: true,
    explorerUrl: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    symbol: 'SOVRA',
    name: 'SOVRA',
    decimals: 18,
    network: 'Ethereum',
    chainId: 1,
    enabled: true,
    pendingOfficialConfiguration: true,
    explorerUrl: 'https://etherscan.io',
  },
  {
    symbol: 'ENM',
    name: 'EnergieMIND',
    decimals: 18,
    network: 'Ethereum',
    chainId: 1,
    enabled: true,
    pendingOfficialConfiguration: true,
    explorerUrl: 'https://etherscan.io',
  },
];

export const ENK_TOKEN_META = {
  maxSupply: '100000000000',
  status: 'verified' as const,
};

export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKEN_REGISTRY.find((t) => t.symbol === symbol);
}

export function getTokensForChain(chainId: number): TokenConfig[] {
  return TOKEN_REGISTRY.filter((t) => t.chainId === chainId && t.enabled);
}
