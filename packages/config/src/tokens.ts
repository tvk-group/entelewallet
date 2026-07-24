import type { TokenConfig } from '@entelewallet/types';
import {
  getChainByChainId,
  getDefaultNetworkViewId,
  getDisplayNetworkById,
} from './chain-registry/registry';
import { MAJOR_TOKENS } from './major-tokens';

const ENK_CONTRACT = '0xC95343B3f8A5af57a9b3B1acFf3D2a7654Fa28F6';

/** ERC-20 and ecosystem tokens — native gas tokens are derived from the chain registry. */
export const TOKEN_REGISTRY: TokenConfig[] = [
  // Ethereum / EnteleKRON (chainId 1)
  {
    symbol: 'ENK',
    name: 'EnteleKRON',
    decimals: 18,
    network: 'EnteleKRON',
    chainId: 1,
    contractAddress: ENK_CONTRACT,
    enabled: true,
    logo: '/icons/tokens/enk.png',
    fiatQuotePolicy: 'none',
    explorerUrl: `https://etherscan.io/token/${ENK_CONTRACT}`,
    networkViews: ['entelekron', 'ethereum'],
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    network: 'Ethereum',
    chainId: 1,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    enabled: true,
    logo: '/icons/tokens/usdt-ethereum.png',
    coingeckoId: 'tether',
    explorerUrl: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
    networkViews: ['entelekron', 'ethereum'],
  },
  {
    symbol: 'SOVRA',
    name: 'SOVRA',
    decimals: 18,
    network: 'EnteleKRON',
    chainId: 1,
    enabled: true,
    pendingOfficialConfiguration: true,
    logo: '/icons/tokens/sovra.png',
    fiatQuotePolicy: 'none',
    explorerUrl: 'https://etherscan.io',
    networkViews: ['entelekron', 'ethereum'],
  },
  {
    symbol: 'ENM',
    name: 'EnergieMIND',
    decimals: 18,
    network: 'EnteleKRON',
    chainId: 1,
    enabled: true,
    pendingOfficialConfiguration: true,
    logo: '/icons/tokens/enm.png',
    fiatQuotePolicy: 'none',
    explorerUrl: 'https://etherscan.io',
    networkViews: ['entelekron', 'ethereum'],
  },
  // Base
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    network: 'Base',
    chainId: 8453,
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    enabled: true,
    logo: '/icons/tokens/usdc-base.png',
    coingeckoId: 'usd-coin',
    explorerUrl: 'https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  // Polygon
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    network: 'Polygon',
    chainId: 137,
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    enabled: true,
    logo: '/icons/tokens/usdc-polygon.png',
    coingeckoId: 'usd-coin',
    explorerUrl: 'https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },
  // BNB Chain
  {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    network: 'BNB Chain',
    chainId: 56,
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    enabled: true,
    logo: '/icons/tokens/usdt-bnb.png',
    coingeckoId: 'tether',
    explorerUrl: 'https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955',
  },
  // Arbitrum
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    network: 'Arbitrum',
    chainId: 42161,
    contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    enabled: true,
    logo: '/icons/tokens/usdc-arbitrum.png',
    coingeckoId: 'usd-coin',
    explorerUrl: 'https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  // Optimism
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    network: 'Optimism',
    chainId: 10,
    contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    enabled: true,
    logo: '/icons/tokens/usdc-optimism.png',
    coingeckoId: 'usd-coin',
    explorerUrl: 'https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  // Avalanche
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    network: 'Avalanche',
    chainId: 43114,
    contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    enabled: true,
    logo: '/icons/tokens/usdc-avalanche.png',
    coingeckoId: 'usd-coin',
    explorerUrl: 'https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  },
  ...MAJOR_TOKENS,
];

export const ENK_TOKEN_META = {
  maxSupply: '100000000000',
  status: 'verified' as const,
};

function buildNativeToken(chainId: number): TokenConfig | undefined {
  const chain = getChainByChainId(chainId);
  if (!chain) return undefined;

  const explorer = chain.blockExplorerUrls[0] ?? '';
  return {
    symbol: chain.nativeCurrency.symbol,
    name: chain.nativeCurrency.name,
    decimals: chain.nativeCurrency.decimals,
    network: chain.name,
    chainId: chain.chainId,
    enabled: true,
    isNative: true,
    logo: chain.icon,
    explorerUrl: explorer,
  };
}

export function getTokenBySymbol(symbol: string, chainId?: number): TokenConfig | undefined {
  return TOKEN_REGISTRY.find(
    (t) => t.symbol === symbol && (chainId === undefined || t.chainId === chainId),
  );
}

export function getTokensForChain(chainId: number, networkViewId?: string): TokenConfig[] {
  const viewId = networkViewId ?? getDefaultNetworkViewId(chainId);
  const view = getDisplayNetworkById(viewId);
  const native = buildNativeToken(chainId);

  if (native && view) {
    native.network = view.name;
    if (view.id === 'entelekron') {
      native.logo = view.icon;
    }
  }

  const erc20s = TOKEN_REGISTRY.filter((token) => {
    if (token.chainId !== chainId || !token.enabled) return false;
    if (!token.networkViews?.length) return true;
    return token.networkViews.includes(viewId);
  });

  const tokens: TokenConfig[] = [];
  if (native) tokens.push(native);

  if (viewId === 'entelekron') {
    const enkFirst = [...erc20s].sort((a, b) => {
      if (a.symbol === 'ENK') return -1;
      if (b.symbol === 'ENK') return 1;
      return a.name.localeCompare(b.name);
    });
    return [...tokens.filter((t) => t.isNative), ...enkFirst];
  }

  return [...tokens, ...erc20s];
}
