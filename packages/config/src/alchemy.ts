/** Alchemy network slugs for Portfolio / Token API (server-side only). */
export const ALCHEMY_NETWORK_SLUGS: Record<number, string> = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  137: 'polygon-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
  56: 'bnb-mainnet',
  43114: 'avax-mainnet',
  5000: 'mantle-mainnet',
};

export function getAlchemyNetworkSlug(chainId: number): string | undefined {
  return ALCHEMY_NETWORK_SLUGS[chainId];
}

export function buildAlchemyUrl(chainId: number, apiKey: string): string | undefined {
  const slug = getAlchemyNetworkSlug(chainId);
  if (!slug) return undefined;
  return `https://${slug}.g.alchemy.com/v2/${apiKey}`;
}

/** Chains with full portfolio balance reads (EVM). */
export function getFullPortfolioChainIds(): number[] {
  return [1, 8453, 5000, 1404];
}
