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
import { mainnet, base, sepolia } from 'wagmi/chains';
import type { Config } from 'wagmi';
import { CANONICAL_APP_URL } from '@entelewallet/config';

/** Required by RainbowKit when no real project ID is configured — WalletConnect is omitted from the wallet list. */
const PLACEHOLDER_PROJECT_ID = '00000000000000000000000000000000';

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || '';

/** WalletConnect / Reown Cloud project IDs are 32-character hex strings. */
export function isValidWalletConnectProjectId(projectId: string): boolean {
  return /^[a-f0-9]{32}$/i.test(projectId);
}

export const isWalletConnectConfigured = isValidWalletConnectProjectId(walletConnectProjectId);

export const enteleChains =
  process.env.NODE_ENV === 'development'
    ? ([mainnet, base, sepolia] as const)
    : ([mainnet, base] as const);

function walletConnectMetadata() {
  return {
    name: 'EnteleWALLET',
    description: 'EnteleWALLET Lite — verified wallet access for the EnteleKRON ecosystem.',
    url: CANONICAL_APP_URL,
    icons: [`${CANONICAL_APP_URL}/icons/icon-512.png`],
  };
}

/** Honest wallet grouping — browser extensions + WalletConnect QR only. */
export function buildEnteleWalletList(projectId: string): WalletList {
  const wallets: WalletList = [
    {
      groupName: 'Browser Wallets',
      wallets: [injectedWallet, metaMaskWallet, rabbyWallet, coinbaseWallet, okxWallet],
    },
  ];

  if (isValidWalletConnectProjectId(projectId)) {
    wallets.push({
      groupName: 'Mobile / QR',
      wallets: [walletConnectWallet],
    });
  }

  return wallets;
}

export function createEnteleWagmiConfig(): Config {
  const projectId = isWalletConnectConfigured ? walletConnectProjectId : PLACEHOLDER_PROJECT_ID;

  return getDefaultConfig({
    appName: 'EnteleWALLET',
    appDescription:
      'EnteleWALLET Lite — connect and verify your wallet for the EnteleKRON ecosystem.',
    appUrl: CANONICAL_APP_URL,
    projectId,
    wallets: buildEnteleWalletList(walletConnectProjectId),
    chains: [...enteleChains],
    ssr: true,
    multiInjectedProviderDiscovery: true,
    walletConnectParameters: {
      metadata: walletConnectMetadata(),
    },
  });
}
