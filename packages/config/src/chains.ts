import type { ChainConfig } from '@entelewallet/types';
import {
  getChainByChainId,
  getSupportedChainIds,
  getWalletConnectChains,
  loadChains,
} from './chain-registry';

export {
  getChainByChainId,
  getChainById,
  getChainsByUiCategory,
  getDefaultNetworkViewId,
  getDisplayNetworkById,
  getDisplayNetworks,
  getRegistrySections,
  getSupportedChainIds,
  getWalletConnectChains,
  loadChains,
  loadTvkModules,
} from './chain-registry';

export type { ChainDefinition, TvkModule, UiCategory } from './chain-registry';

function toChainConfig(chain: ReturnType<typeof loadChains>[number]): ChainConfig {
  const explorer = chain.blockExplorerUrls[0] ?? '';
  const explorerName = explorer.includes('etherscan')
    ? 'Etherscan'
    : chain.name;

  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorers: {
      default: { name: explorerName, url: explorer },
    },
    testnet: chain.status === 'testnet',
  };
}

export const SUPPORTED_CHAIN_IDS: number[] = getSupportedChainIds();

export const CHAINS: Record<number, ChainConfig> = Object.fromEntries(
  getWalletConnectChains().map((chain) => [chain.chainId, toChainConfig(chain)]),
);

export function getChainConfig(chainId: number): ChainConfig | undefined {
  const fromRegistry = getChainByChainId(chainId);
  if (!fromRegistry) return CHAINS[chainId];
  return toChainConfig(fromRegistry);
}

export function isSupportedChain(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId);
}

export function getDefaultChainId(): number {
  return 1;
}
