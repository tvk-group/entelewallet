/** CoinGecko asset platform id by EVM chainId (for contract-based pricing). */
export const CHAIN_COINGECKO_PLATFORM: Record<number, string> = {
  1: 'ethereum',
  10: 'optimistic-ethereum',
  56: 'binance-smart-chain',
  100: 'xdai',
  137: 'polygon-pos',
  250: 'fantom',
  324: 'zksync',
  8453: 'base',
  42161: 'arbitrum-one',
  43114: 'avalanche',
  5000: 'mantle',
  534352: 'scroll',
  59144: 'linea',
  81457: 'blast',
  42220: 'celo',
  25: 'cronos',
  34443: 'mode',
  1404: 'ethereum', // BlockDAG — fallback to ethereum platform for pricing attempts
};

export function getCoingeckoPlatform(chainId: number): string | undefined {
  return CHAIN_COINGECKO_PLATFORM[chainId];
}

export function contractPriceKey(chainId: number, contractAddress: string): string {
  return `contract:${chainId}:${contractAddress.toLowerCase()}`;
}
