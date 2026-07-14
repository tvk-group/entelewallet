import { getWalletConnectChains } from './chain-registry/registry';

/** Alchemy network slugs for Portfolio / Token API (server-side only). */
export const ALCHEMY_NETWORK_SLUGS: Record<number, string> = {
  1: 'eth-mainnet',
  10: 'opt-mainnet',
  25: 'cronos-mainnet',
  56: 'bnb-mainnet',
  100: 'gnosis-mainnet',
  137: 'polygon-mainnet',
  250: 'fantom-mainnet',
  324: 'zksync-mainnet',
  8453: 'base-mainnet',
  42161: 'arb-mainnet',
  43114: 'avax-mainnet',
  5000: 'mantle-mainnet',
  42220: 'celo-mainnet',
  534352: 'scroll-mainnet',
  59144: 'linea-mainnet',
  81457: 'blast-mainnet',
  34443: 'mode-mainnet',
};

export function getAlchemyNetworkSlug(chainId: number): string | undefined {
  return ALCHEMY_NETWORK_SLUGS[chainId];
}

export function buildAlchemyUrl(chainId: number, apiKey: string): string | undefined {
  const slug = getAlchemyNetworkSlug(chainId);
  if (!slug) return undefined;
  return `https://${slug}.g.alchemy.com/v2/${apiKey}`;
}

/** EVM chains with full portfolio balance reads — all active mainnet wallet-connect chains. */
export function getFullPortfolioChainIds(): number[] {
  const seen = new Set<number>();
  const ids: number[] = [];

  for (const chain of getWalletConnectChains({ includeTestnets: false })) {
    if (chain.portfolioTier === 'price-only') continue;
    if (seen.has(chain.chainId)) continue;
    seen.add(chain.chainId);
    ids.push(chain.chainId);
  }

  return ids.length > 0 ? ids : [1, 8453, 137, 42161, 10, 56, 43114, 5000, 1404];
}

export function getAlchemyDiscoveryChainIds(): number[] {
  return Object.keys(ALCHEMY_NETWORK_SLUGS).map(Number);
}
