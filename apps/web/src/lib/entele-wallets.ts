import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { WalletList } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  walletConnectWallet,
  baseAccount,
} from '@rainbow-me/rainbowkit/wallets';
import { mainnet, base, sepolia } from 'wagmi/chains';
import type { Config } from 'wagmi';
import { CANONICAL_APP_URL } from '@entelewallet/config';
import { isFeatureEnabled } from '@entelewallet/config';

const PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000';

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || '';

export const isWalletConnectConfigured = Boolean(walletConnectProjectId);

export const enteleChains =
  process.env.NODE_ENV === 'development'
    ? ([mainnet, base, sepolia] as const)
    : ([mainnet, base] as const);

export function buildEnteleWalletList(projectId: string): WalletList {
  const wallets: WalletList = [
    {
      groupName: 'Installed Browser Wallets',
      wallets: [injectedWallet, metaMaskWallet, rabbyWallet, coinbaseWallet, okxWallet],
    },
  ];

  if (projectId) {
    wallets.push({
      groupName: 'Mobile Wallets',
      wallets: [walletConnectWallet],
    });
  }

  if (isFeatureEnabled('ENABLE_BASE_ACCOUNT')) {
    wallets.push({
      groupName: 'Future / Optional',
      wallets: [baseAccount],
    });
  }

  return wallets;
}

export function createEnteleWagmiConfig(): Config {
  const projectId = walletConnectProjectId || PLACEHOLDER_PROJECT_ID;

  return getDefaultConfig({
    appName: 'EnteleWALLET',
    appDescription:
      'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
    appUrl: CANONICAL_APP_URL,
    projectId,
    wallets: buildEnteleWalletList(walletConnectProjectId),
    chains: enteleChains,
    ssr: true,
    multiInjectedProviderDiscovery: true,
    walletConnectParameters: {
      metadata: {
        name: 'EnteleWALLET',
        description: 'EnteleWALLET Lite wallet connection',
        url: CANONICAL_APP_URL,
        icons: [`${CANONICAL_APP_URL}/icons/icon-512.png`],
      },
    },
  });
}
