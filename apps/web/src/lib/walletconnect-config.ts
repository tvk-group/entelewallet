import { isFeatureEnabled } from '@entelewallet/config';

/** Env keys accepted for the Reown / WalletConnect Cloud project ID (32-char hex). */
const PROJECT_ID_ENV_KEYS = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_REOWN_PROJECT_ID',
  'NEXT_PUBLIC_WC_PROJECT_ID',
] as const;

export function resolveWalletConnectProjectId(): string {
  for (const key of PROJECT_ID_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

export function isValidWalletConnectProjectId(projectId: string): boolean {
  return /^[a-f0-9]{32}$/i.test(projectId);
}

export function isWalletConnectEnabled(): boolean {
  if (!isFeatureEnabled('ENABLE_WALLET_CONNECT')) return false;
  return isValidWalletConnectProjectId(resolveWalletConnectProjectId());
}

export const walletConnectProjectId = resolveWalletConnectProjectId();

/** Whether WalletConnect / Reown is configured for this build. */
export const isWalletConnectConfigured = isWalletConnectEnabled();
