import { defineChain, type Chain } from 'viem';
import {
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  bsc,
  mainnet,
  optimism,
  polygon,
  sepolia,
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
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
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
