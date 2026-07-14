/** Remote chain icon fallbacks (DefiLlama / CoinGecko) when local assets are missing. */
const REMOTE_CHAIN_ICONS: Record<string, string> = {
  linea: 'https://icons.llamao.fi/icons/chains/rsz_linea.jpg',
  scroll: 'https://icons.llamao.fi/icons/chains/rsz_scroll.jpg',
  zksync: 'https://icons.llamao.fi/icons/chains/rsz_zksync%20era.jpg',
  blast: 'https://icons.llamao.fi/icons/chains/rsz_blast.jpg',
  fantom: 'https://icons.llamao.fi/icons/chains/rsz_fantom.jpg',
  gnosis: 'https://icons.llamao.fi/icons/chains/rsz_gnosis.jpg',
  mantle: 'https://icons.llamao.fi/icons/chains/rsz_mantle.jpg',
  ethereum: 'https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg',
  base: 'https://icons.llamao.fi/icons/chains/rsz_base.jpg',
  polygon: 'https://icons.llamao.fi/icons/chains/rsz_polygon.jpg',
  bnb: 'https://icons.llamao.fi/icons/chains/rsz_binance.jpg',
  arbitrum: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg',
  optimism: 'https://icons.llamao.fi/icons/chains/rsz_optimism.jpg',
  avalanche: 'https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg',
  blockdag: 'https://coin-images.coingecko.com/coins/images/39354/small/blockdag.jpeg',
  sui: 'https://coin-images.coingecko.com/coins/images/26375/small/sui-ocean-square.png',
  cardano: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png',
  entelekron: '/icons/chains/entelekron.png',
};

/** Resolve best chain icon — local path preferred, then remote fallback by network id. */
export function resolveChainIcon(params: {
  icon?: string;
  networkId?: string;
}): string | undefined {
  if (params.icon && !params.icon.endsWith('ethereum.svg')) {
    return params.icon;
  }
  if (params.networkId && REMOTE_CHAIN_ICONS[params.networkId]) {
    return REMOTE_CHAIN_ICONS[params.networkId];
  }
  return params.icon;
}
