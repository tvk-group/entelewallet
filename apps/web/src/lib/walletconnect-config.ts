import { isFeatureEnabled } from '@entelewallet/config';

/** Env keys accepted for the Reown / WalletConnect Cloud project ID (32-char hex). */
const PROJECT_ID_ENV_KEYS = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'NEXT_PUBLIC_REOWN_PROJECT_ID',
  'NEXT_PUBLIC_WC_PROJECT_ID',
] as const;

/**
 * Team Reown project ID used when env is unset so WalletConnect stays available in the wallet list.
 * Override with NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in production deployments.
 */
export const WALLETCONNECT_FALLBACK_PROJECT_ID = '21fef48091f12692cad574a6f7753643';

declare global {
  interface Window {
    __ENTELE_WC_PROJECT_ID__?: string;
  }
}

export function isWalletConnectFeatureEnabled(): boolean {
  return isFeatureEnabled('ENABLE_WALLET_CONNECT');
}

export function resolveWalletConnectProjectId(): string {
  for (const key of PROJECT_ID_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  if (typeof window !== 'undefined') {
    const runtime = window.__ENTELE_WC_PROJECT_ID__?.trim();
    if (runtime) return runtime;
  }

  return WALLETCONNECT_FALLBACK_PROJECT_ID;
}

export function isValidWalletConnectProjectId(projectId: string): boolean {
  return /^[a-f0-9]{32}$/i.test(projectId);
}

export function isWalletConnectEnabled(): boolean {
  if (!isWalletConnectFeatureEnabled()) return false;
  return isValidWalletConnectProjectId(resolveWalletConnectProjectId());
}

export function isWalletConnectConfigured(): boolean {
  return isWalletConnectEnabled();
}

/** @deprecated Use isWalletConnectConfigured() — evaluated once at import and can be stale. */
export const walletConnectProjectId = resolveWalletConnectProjectId();
