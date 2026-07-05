import type { TokenConfig } from '@entelewallet/types';

/**
 * Central token registry — single source of truth for EnteleWALLET Lite.
 * Contract addresses must match the main EnteleKRON platform config.
 * Do not invent addresses. If unknown, mark pendingOfficialConfiguration.
 */
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
    enabled: true,
    pendingOfficialConfiguration: true,
    explorerUrl: 'https://etherscan.io',
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

export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKEN_REGISTRY.find((t) => t.symbol === symbol);
}

export function getTokensForChain(chainId: number): TokenConfig[] {
  return TOKEN_REGISTRY.filter((t) => t.chainId === chainId && t.enabled);
}
