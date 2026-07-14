import type { WalletPreferences } from '@entelewallet/types';
import { DEFAULT_PORTFOLIO_PREFERENCES } from '@entelewallet/config';
import {
  patchWalletPreferences as patchRemotePreferences,
  fetchWalletPreferences as fetchRemotePreferences,
} from '@/lib/entelekron-api';
import { EntelekronApiError } from '@/lib/entelekron-api';
import {
  readPortfolioPreferences,
  writePortfolioPreferences,
} from '@/lib/portfolio-preferences';

async function fetchLocalPreferences(): Promise<WalletPreferences | null> {
  try {
    const res = await fetch('/api/user/wallet-preferences', { credentials: 'include' });
    if (res.ok) {
      return (await res.json()) as WalletPreferences;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function patchLocalPreferences(patch: Partial<WalletPreferences>): Promise<WalletPreferences> {
  const current = readPortfolioPreferences();
  const next = { ...current, ...patch };
  writePortfolioPreferences(next);

  try {
    const res = await fetch('/api/user/wallet-preferences', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const remote = (await res.json()) as WalletPreferences;
      writePortfolioPreferences(remote);
      return remote;
    }
  } catch {
    /* ignore */
  }

  try {
    const remote = await patchRemotePreferences(patch);
    writePortfolioPreferences(remote);
    return remote;
  } catch (error) {
    if (!(error instanceof EntelekronApiError && error.status === 401)) {
      console.warn('[EnteleWALLET] preferences sync failed', error);
    }
  }

  return next;
}

export async function loadSyncedPreferences(): Promise<WalletPreferences> {
  const local = readPortfolioPreferences();

  const fromBff = await fetchLocalPreferences();
  if (fromBff) {
    const merged = { ...DEFAULT_PORTFOLIO_PREFERENCES, ...fromBff };
    writePortfolioPreferences(merged);
    return merged;
  }

  try {
    const remote = await fetchRemotePreferences();
    const merged = { ...DEFAULT_PORTFOLIO_PREFERENCES, ...remote };
    writePortfolioPreferences(merged);
    return merged;
  } catch (error) {
    if (!(error instanceof EntelekronApiError && error.status === 401)) {
      console.warn('[EnteleWALLET] preferences fetch failed', error);
    }
  }

  return local;
}

export { patchLocalPreferences };
