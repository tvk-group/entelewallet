import { getChainByChainId } from '@entelewallet/config';
import type { Chain } from 'viem';
import { getWagmiViemChains } from '@/lib/entele-chains';

const SWITCH_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network switch timed out')), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function registryChainToWalletChain(chainId: number): Chain | undefined {
  const registry = getChainByChainId(chainId);
  if (!registry) return undefined;

  const wagmiChain = getWagmiViemChains().find((c) => c.id === chainId);
  if (wagmiChain) return wagmiChain;

  return {
    id: registry.chainId,
    name: registry.name,
    nativeCurrency: registry.nativeCurrency,
    rpcUrls: { default: { http: registry.rpcUrls } },
    blockExplorers: {
      default: {
        name: registry.name,
        url: registry.blockExplorerUrls[0] ?? '',
      },
    },
  } as Chain;
}

export type SwitchWalletChainParams = {
  chainId: number;
  switchChainAsync: (args: { chainId: number }) => Promise<unknown>;
  addChainAsync?: (args: { chain: Chain }) => Promise<unknown>;
};

/** Switch wallet network with timeout; adds chain to wallet when not in wagmi list. */
export async function switchWalletChain({
  chainId,
  switchChainAsync,
  addChainAsync,
}: SwitchWalletChainParams): Promise<void> {
  if (!getChainByChainId(chainId)?.capabilities.walletConnect) {
    throw new Error('unsupported_network');
  }

  try {
    await withTimeout(switchChainAsync({ chainId }), SWITCH_TIMEOUT_MS);
    return;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const needsAdd =
      message.includes('unrecognized chain') ||
      message.includes('not added') ||
      message.includes('4902') ||
      message.includes('chain not configured');

    if (!needsAdd || !addChainAsync) throw error;

    const chain = registryChainToWalletChain(chainId);
    if (!chain) throw error;

    await withTimeout(addChainAsync({ chain }), SWITCH_TIMEOUT_MS);
    await withTimeout(switchChainAsync({ chainId }), SWITCH_TIMEOUT_MS);
  }
}
