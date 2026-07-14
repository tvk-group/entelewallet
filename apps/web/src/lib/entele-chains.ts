import { defineChain, type Chain } from 'viem';
import {
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  blast,
  bsc,
  celo,
  cronos,
  fantom,
  gnosis,
  linea,
  mainnet,
  mantle,
  mode,
  optimism,
  polygon,
  scroll,
  sepolia,
  zkSync,
} from 'viem/chains';
import { getWalletConnectChains } from '@entelewallet/config';

const KNOWN_CHAINS: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [polygon.id]: polygon,
  [bsc.id]: bsc,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [avalanche.id]: avalanche,
  [mantle.id]: mantle,
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
  [linea.id]: linea,
  [scroll.id]: scroll,
  [zkSync.id]: zkSync,
  [blast.id]: blast,
  [fantom.id]: fantom,
  [gnosis.id]: gnosis,
  [celo.id]: celo,
  [cronos.id]: cronos,
  [mode.id]: mode,
};

function registryChainToViem(chain: ReturnType<typeof getWalletConnectChains>[number]): Chain {
  const known = KNOWN_CHAINS[chain.chainId];
  if (known) return known;

  return defineChain({
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: {
      default: { http: chain.rpcUrls },
    },
    blockExplorers: {
      default: {
        name: chain.name,
        url: chain.blockExplorerUrls[0] ?? '',
      },
    },
    testnet: chain.status === 'testnet',
  });
}

/** Wagmi/viem chain list derived from the modular chain registry. */
export function getEnteleViemChains(): readonly [Chain, ...Chain[]] {
  const chains = getWalletConnectChains().map(registryChainToViem);
  if (chains.length === 0) return [mainnet];
  return chains as [Chain, ...Chain[]];
}
