import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { WalletList } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet } from 'wagmi/chains';
import { createConfig, http, type Config } from 'wagmi';
import { CANONICAL_APP_URL, BRAND_ASSETS } from '@entelewallet/config';
import { getWagmiViemChains } from '@/lib/entele-chains';

const PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000';

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || '';

export function isValidWalletConnectProjectId(projectId: string): boolean {
  return /^[a-f0-9]{32}$/i.test(projectId);
}

export const isWalletConnectConfigured = isValidWalletConnectProjectId(walletConnectProjectId);

export const wagmiChains = getWagmiViemChains();

function walletConnectMetadata() {
  const baseUrl = CANONICAL_APP_URL.replace(/\/$/, '');
  return {
    name: 'EnteleWALLET',
    description: 'EnteleWALLET Lite — verified wallet access for the EnteleKRON ecosystem.',
    url: baseUrl,
      icons: [`${baseUrl}${BRAND_ASSETS.iconMark}`],
  };
}

/** MetaMask only via dedicated connector — avoids duplicate injected discovery delays. */
function buildBrowserOnlyWalletList(): WalletList {
  return [
    {
      groupName: 'Browser Wallets',
      wallets: [metaMaskWallet, rabbyWallet, coinbaseWallet, okxWallet],
    },
  ];
}

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
    chains: [...wagmiChains],
    ssr: true,
    multiInjectedProviderDiscovery: false,
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
      chains: [...wagmiChains],
      ssr: true,
      multiInjectedProviderDiscovery: false,
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

/** @deprecated use wagmiChains */
export const enteleChains = wagmiChains;
