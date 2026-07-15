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
  isWalletConnectFeatureEnabled,
  resolveWalletConnectProjectId,
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

/** Wallet list for RainbowKit — WalletConnect group is always shown when the feature flag is on. */
export function buildEnteleWalletList(): WalletList {
  if (!isWalletConnectFeatureEnabled()) {
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
  const wcFeatureOn = isWalletConnectFeatureEnabled();
  const wcEnabled = isWalletConnectEnabled();
  const resolvedProjectId = isValidWalletConnectProjectId(projectId)
    ? projectId
    : PLACEHOLDER_PROJECT_ID;

  if (wcFeatureOn && !isValidWalletConnectProjectId(projectId) && typeof window !== 'undefined') {
    console.warn(
      '[EnteleWALLET] Invalid WalletConnect project ID — set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (32-char Reown ID).',
    );
  }

  try {
    const wallets = buildEnteleWalletList(projectId);

    return getDefaultConfig({
      appName: 'EnteleWALLET',
      appDescription:
        'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
      appUrl:
        typeof window !== 'undefined'
          ? window.location.origin
          : CANONICAL_APP_URL,
      projectId: wcFeatureOn ? resolvedProjectId : PLACEHOLDER_PROJECT_ID,
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
