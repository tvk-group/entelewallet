/** CoinGecko thumb image URLs for common tokens (no API call required). */
const COINGECKO_THUMB: Record<string, string> = {
  ethereum: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png',
  weth: 'https://coin-images.coingecko.com/coins/images/2518/small/weth.png',
  'wrapped-bitcoin': 'https://coin-images.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  tether: 'https://coin-images.coingecko.com/coins/images/325/small/Tether.png',
  'usd-coin': 'https://coin-images.coingecko.com/coins/images/6319/small/usdc.png',
  dai: 'https://coin-images.coingecko.com/coins/images/9956/small/Badge_Dai.png',
  chainlink: 'https://coin-images.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  wbnb: 'https://coin-images.coingecko.com/coins/images/12591/small/binance-coin-logo.png',
  'wrapped-avax': 'https://coin-images.coingecko.com/coins/images/15075/small/wrapped-avax.png',
  bitcoin: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png',
  solana: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png',
  ripple: 'https://coin-images.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
  cardano: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png',
  sui: 'https://coin-images.coingecko.com/coins/images/26375/small/sui-ocean-square.png',
  mantle: 'https://coin-images.coingecko.com/coins/images/30980/small/Mantle-Logo-mark.png',
  blockdag: 'https://coin-images.coingecko.com/coins/images/39354/small/blockdag.jpeg',
  fantom: 'https://coin-images.coingecko.com/coins/images/4001/small/Fantom_round.png',
  xdai: 'https://coin-images.coingecko.com/coins/images/11062/small/Identity-Primary-DarkBG.png',
  tron: 'https://coin-images.coingecko.com/coins/images/1094/small/tron-logo.png',
  dogecoin: 'https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png',
  polkadot: 'https://coin-images.coingecko.com/coins/images/12171/small/polkadot.png',
  litecoin: 'https://coin-images.coingecko.com/coins/images/2/small/litecoin.png',
  'shiba-inu': 'https://coin-images.coingecko.com/coins/images/11939/small/shiba.png',
  'the-open-network': 'https://coin-images.coingecko.com/coins/images/17980/small/ton_symbol.png',
  'polygon-ecosystem-token': 'https://coin-images.coingecko.com/coins/images/32440/small/polygon.png',
  binancecoin: 'https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  'avalanche-2': 'https://coin-images.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
};

export function getCoingeckoThumbUrl(coingeckoId?: string): string | undefined {
  if (!coingeckoId) return undefined;
  return COINGECKO_THUMB[coingeckoId];
}

/** Resolve best logo URL for a token — local path preferred, then CoinGecko thumb. */
export function resolveTokenLogo(params: {
  logo?: string;
  coingeckoId?: string;
  symbol?: string;
}): string | undefined {
  if (params.logo) return params.logo;
  const fromCg = getCoingeckoThumbUrl(params.coingeckoId);
  if (fromCg) return fromCg;
  if (params.symbol === 'ETH') return COINGECKO_THUMB.ethereum;
  if (params.symbol === 'POL') return COINGECKO_THUMB['polygon-ecosystem-token'];
  if (params.symbol === 'BNB') return COINGECKO_THUMB.binancecoin;
  if (params.symbol === 'AVAX') return COINGECKO_THUMB['avalanche-2'];
  return undefined;
}
