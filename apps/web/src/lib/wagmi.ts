import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { WalletList } from '@rainbow-me/rainbowkit';
import { walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';
import { createConfig, http, type Config } from 'wagmi';
import { CANONICAL_APP_URL, BRAND_ASSETS } from '@entelewallet/config';
import { getWagmiViemChains } from '@/lib/entele-chains';
import {
  isValidWalletConnectProjectId,
  isWalletConnectEnabled,
  isWalletConnectFeatureEnabled,
  resolveWalletConnectProjectId,
  WALLETCONNECT_FALLBACK_PROJECT_ID,
} from '@/lib/walletconnect-config';

export {
  isValidWalletConnectProjectId,
  isWalletConnectEnabled,
  isWalletConnectFeatureEnabled,
  isWalletConnectConfigured,
  resolveWalletConnectProjectId,
  walletConnectProjectId,
  WALLETCONNECT_FALLBACK_PROJECT_ID,
} from '@/lib/walletconnect-config';

export const wagmiChains = getWagmiViemChains();

function walletConnectMetadata() {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : CANONICAL_APP_URL.replace(/\/$/, '');

  return {
    name: 'EnteleWALLET',
    description: 'EnteleWALLET Lite — verified wallet access for the EnteleKRON ecosystem.',
    url: origin,
    icons: [`${origin}${BRAND_ASSETS.iconMark}`],
  };
}

/** EnteleWALLET connects via WalletConnect QR — no third-party browser wallets in the list. */
export function buildEnteleWalletList(): WalletList {
  if (!isWalletConnectFeatureEnabled()) {
    return [];
  }

  return [
    {
      groupName: 'EnteleWALLET',
      wallets: [walletConnectWallet],
    },
  ];
}

function resolveProjectIdForConfig(): string {
  const projectId = resolveWalletConnectProjectId();
  return isValidWalletConnectProjectId(projectId) ? projectId : WALLETCONNECT_FALLBACK_PROJECT_ID;
}

function createEnteleWalletConfig(): Config {
  const projectId = resolveProjectIdForConfig();
  const wallets = buildEnteleWalletList();

  return getDefaultConfig({
    appName: 'EnteleWALLET',
    appDescription:
      'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
    appUrl:
      typeof window !== 'undefined' ? window.location.origin : CANONICAL_APP_URL,
    projectId,
    wallets,
    chains: [...wagmiChains],
    ssr: true,
    multiInjectedProviderDiscovery: false,
    walletConnectParameters: {
      metadata: walletConnectMetadata(),
    },
  });
}

export function createEnteleWagmiConfig(): Config {
  if (!isWalletConnectFeatureEnabled()) {
    return createConfig({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
      ssr: true,
    });
  }

  try {
    return createEnteleWalletConfig();
  } catch (error) {
    console.error('[EnteleWALLET] wagmi config error:', error);
    try {
      return createEnteleWalletConfig();
    } catch (fallbackError) {
      console.error('[EnteleWALLET] wagmi fallback config error:', fallbackError);
      return createConfig({
        chains: [mainnet],
        transports: { [mainnet.id]: http() },
        ssr: true,
      });
    }
  }
}

/** @deprecated use wagmiChains */
export const enteleChains = wagmiChains;
