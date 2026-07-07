import chainsData from './chains.json';
import tvkModulesData from './tvk-modules.json';
import type { ChainDefinition, ChainStatus, TvkModule, UiCategory } from './types';
import { withTransactionGate } from './verification';

const UI_SECTION_ORDER: UiCategory[] = [
  'active',
  'testnet',
  'tvk-ecosystem',
  'coming-soon',
  'experimental',
];

export function loadChains(): ChainDefinition[] {
  return (chainsData as ChainDefinition[]).map(withTransactionGate);
}

export function loadTvkModules(): TvkModule[] {
  return tvkModulesData as TvkModule[];
}

export function getChainById(id: string): ChainDefinition | undefined {
  return loadChains().find((chain) => chain.id === id);
}

export function getChainByChainId(chainId: number): ChainDefinition | undefined {
  return loadChains().find((chain) => chain.chainId === chainId);
}

export function getChainsByUiCategory(category: UiCategory): ChainDefinition[] {
  return loadChains().filter((chain) => chain.uiCategory === category);
}

export function getRegistrySections(): Array<{
  id: UiCategory;
  chains: ChainDefinition[];
  modules: TvkModule[];
}> {
  const chains = loadChains();
  const modules = loadTvkModules();

  return UI_SECTION_ORDER.map((id) => ({
    id,
    chains: chains.filter((chain) => chain.uiCategory === id),
    modules: modules.filter((module) => module.uiCategory === id),
  })).filter((section) => section.chains.length > 0 || section.modules.length > 0);
}

export function getWalletConnectChains(options?: { includeTestnets?: boolean }): ChainDefinition[] {
  const includeTestnets = options?.includeTestnets ?? process.env.NODE_ENV === 'development';

  return loadChains().filter((chain) => {
    if (!chain.capabilities.walletConnect || !chain.rpcUrls.length) return false;
    if (chain.status === 'testnet' && !includeTestnets) return false;
    if (chain.status === 'planned') return false;
    return true;
  });
}

export function getSupportedChainIds(options?: { includeTestnets?: boolean }): number[] {
  return getWalletConnectChains(options).map((chain) => chain.chainId);
}
