import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { WalletList } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';
import { createConfig, http, type Config } from 'wagmi';
import { CANONICAL_APP_URL, BRAND_ASSETS } from '@entelewallet/config';
import { getEnteleViemChains } from '@/lib/entele-chains';

/**
 * RainbowKit requires a projectId string even when WalletConnect is disabled in the UI.
 * This placeholder must never be used for live WalletConnect sessions.
 */
const PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000';

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || '';

/** Reown Cloud project IDs are 32-character hex strings. */
export function isValidWalletConnectProjectId(projectId: string): boolean {
  return /^[a-f0-9]{32}$/i.test(projectId);
}

export const isWalletConnectConfigured = isValidWalletConnectProjectId(walletConnectProjectId);

export const enteleChains = getEnteleViemChains();

function walletConnectMetadata() {
  // Use canonical URL for SSR-safe config; both production domains must be Reown-allowlisted.
  const baseUrl = CANONICAL_APP_URL.replace(/\/$/, '');

  return {
    name: 'EnteleWALLET',
    description: 'EnteleWALLET Lite — verified wallet access for the EnteleKRON ecosystem.',
    url: baseUrl,
    icons: [`${baseUrl}${BRAND_ASSETS.icon512Pwa}`],
  };
}

/** Browser extensions only — used when WalletConnect is not configured. */
function buildBrowserOnlyWalletList(): WalletList {
  return [
    {
      groupName: 'Browser Wallets',
      wallets: [injectedWallet, metaMaskWallet, rabbyWallet, coinbaseWallet, okxWallet],
    },
  ];
}

/** Browser wallets + WalletConnect QR when a valid Reown project ID exists. */
export function buildEnteleWalletList(projectId: string): WalletList {
  const wallets = buildBrowserOnlyWalletList();

  if (isValidWalletConnectProjectId(projectId)) {
    wallets.push({
      groupName: 'Mobile / QR',
      wallets: [walletConnectWallet],
    });
  }

  return wallets;
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
    wallets: buildBrowserOnlyWalletList(),
    chains: [...enteleChains],
    ssr: true,
    multiInjectedProviderDiscovery: true,
  });
}

export function createEnteleWagmiConfig(): Config {
  if (!isWalletConnectConfigured && typeof window !== 'undefined') {
    console.warn('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
  }

  try {
    const wallets = buildEnteleWalletList(walletConnectProjectId);
    const projectId = isWalletConnectConfigured ? walletConnectProjectId : PLACEHOLDER_PROJECT_ID;

    return getDefaultConfig({
      appName: 'EnteleWALLET',
      appDescription:
        'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
      appUrl: CANONICAL_APP_URL,
      projectId,
      wallets,
      chains: [...enteleChains],
      ssr: true,
      multiInjectedProviderDiscovery: true,
      walletConnectParameters: isWalletConnectConfigured
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
