import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { WalletList } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';
import { createConfig, http, type Config } from 'wagmi';
import { CANONICAL_APP_URL, BRAND_ASSETS } from '@entelewallet/config';
import { getWagmiViemChains } from '@/lib/entele-chains';
import {
  isValidWalletConnectProjectId,
  isWalletConnectEnabled,
  resolveWalletConnectProjectId,
} from '@/lib/walletconnect-config';

export {
  isValidWalletConnectProjectId,
  isWalletConnectEnabled,
  isWalletConnectConfigured,
  resolveWalletConnectProjectId,
  walletConnectProjectId,
} from '@/lib/walletconnect-config';

const PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000';

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

function buildBrowserWalletList(): WalletList {
  return [
    {
      groupName: 'Browser Wallets',
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, okxWallet],
    },
  ];
}

function buildWalletConnectList(): WalletList {
  return [
    {
      groupName: 'WalletConnect',
      wallets: [walletConnectWallet, rainbowWallet, trustWallet, ledgerWallet],
    },
    ...buildBrowserWalletList(),
  ];
}

export function buildEnteleWalletList(projectId: string): WalletList {
  if (!isValidWalletConnectProjectId(projectId) || !isWalletConnectEnabled()) {
    return buildBrowserWalletList();
  }
  return buildWalletConnectList();
}

function createBrowserOnlyFallbackConfig(): Config {
  if (typeof window !== 'undefined') {
    console.warn(
      '[EnteleWALLET] WalletConnect unavailable — using browser-wallet-only fallback config.',
    );
  }

  return getDefaultConfig({
    appName: 'EnteleWALLET',
    appDescription:
      'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
    appUrl: CANONICAL_APP_URL,
    projectId: PLACEHOLDER_PROJECT_ID,
    wallets: buildBrowserWalletList(),
    chains: [...wagmiChains],
    ssr: true,
    multiInjectedProviderDiscovery: false,
  });
}

export function createEnteleWagmiConfig(): Config {
  const projectId = resolveWalletConnectProjectId();
  const wcEnabled = isWalletConnectEnabled();

  if (!wcEnabled && typeof window !== 'undefined') {
    if (!isValidWalletConnectProjectId(projectId)) {
      console.warn(
        '[EnteleWALLET] WalletConnect disabled — set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (or NEXT_PUBLIC_REOWN_PROJECT_ID) to your 32-char Reown project ID, then rebuild.',
      );
    }
  }

  try {
    const wallets = buildEnteleWalletList(projectId);
    const resolvedProjectId = wcEnabled ? projectId : PLACEHOLDER_PROJECT_ID;

    return getDefaultConfig({
      appName: 'EnteleWALLET',
      appDescription:
        'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
      appUrl:
        typeof window !== 'undefined'
          ? window.location.origin
          : CANONICAL_APP_URL,
      projectId: resolvedProjectId,
      wallets,
      chains: [...wagmiChains],
      ssr: true,
      multiInjectedProviderDiscovery: false,
      walletConnectParameters: wcEnabled
        ? { metadata: walletConnectMetadata() }
        : undefined,
    });
  } catch (error) {
    console.error('[EnteleWALLET] wagmi config error:', error);
    try {
      return createBrowserOnlyFallbackConfig();
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
