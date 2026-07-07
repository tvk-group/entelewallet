import type { TokenConfig } from '@entelewallet/types';

/** CoinGecko id for native gas tokens by symbol. */
const NATIVE_COINGECKO: Record<string, string> = {
  ETH: 'ethereum',
  POL: 'polygon-ecosystem-token',
  BNB: 'binancecoin',
  AVAX: 'avalanche-2',
};

/** Resolve CoinGecko id for portfolio pricing. */
export function getCoingeckoId(token: Pick<TokenConfig, 'symbol' | 'coingeckoId' | 'isNative' | 'fiatQuotePolicy'>): string | undefined {
  if (token.fiatQuotePolicy === 'none') return undefined;
  if (token.coingeckoId) return token.coingeckoId;
  if (token.isNative) return NATIVE_COINGECKO[token.symbol];
  return undefined;
}

export function hasMarketQuote(token: Pick<TokenConfig, 'symbol' | 'coingeckoId' | 'isNative' | 'fiatQuotePolicy'>): boolean {
  return getCoingeckoId(token) !== undefined;
}

export function collectCoingeckoIds(tokens: TokenConfig[]): string[] {
  const ids = new Set<string>();
  for (const token of tokens) {
    const id = getCoingeckoId(token);
    if (id) ids.add(id);
  }
  return [...ids];
}
