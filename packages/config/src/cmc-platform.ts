/** CoinGecko id → CoinMarketCap slug (defaults to same string when not listed). */
const COINGECKO_TO_CMC_SLUG: Record<string, string> = {
  'the-open-network': 'toncoin',
  'avalanche-2': 'avalanche',
  binancecoin: 'bnb',
  'polygon-ecosystem-token': 'polygon-ecosystem-token',
  'shiba-inu': 'shiba-inu',
  blockdag: 'blockdag',
};

/** EVM chainId → CoinMarketCap platform slug for contract lookups. */
export const CHAIN_CMC_PLATFORM: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  25: 'cronos',
  56: 'bnb',
  100: 'xdai',
  137: 'polygon',
  250: 'fantom',
  324: 'zksync',
  8453: 'base',
  42161: 'arbitrum',
  43114: 'avalanche',
  5000: 'mantle',
  534352: 'scroll',
  59144: 'linea',
  81457: 'blast',
  42220: 'celo',
  34443: 'mode',
  1404: 'ethereum',
};

export function resolveCmcSlug(coingeckoId: string): string {
  return COINGECKO_TO_CMC_SLUG[coingeckoId] ?? coingeckoId;
}

export function getCmcPlatform(chainId: number): string | undefined {
  return CHAIN_CMC_PLATFORM[chainId];
}
