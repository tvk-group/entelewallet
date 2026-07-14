import {
  getDefaultNetworkViewId,
  getDisplayNetworkById,
} from '@entelewallet/config';
import { readPortfolioPreferences, updatePortfolioPreferences } from '@/lib/portfolio-preferences';

const NETWORK_VIEW_KEY = 'entelewallet-network-view';

const listeners = new Set<() => void>();

function readStoredNetworkViewId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(NETWORK_VIEW_KEY);
  } catch {
    return null;
  }
}

function writeStoredNetworkViewId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NETWORK_VIEW_KEY, id);
  } catch {
    // ignore quota errors
  }
}

function resolveInitialNetworkViewId(fallbackChainId: number): string {
  const fromKey = readStoredNetworkViewId();
  if (fromKey && getDisplayNetworkById(fromKey)) return fromKey;

  const prefs = readPortfolioPreferences();
  if (prefs.networkViewId && getDisplayNetworkById(prefs.networkViewId)) {
    return prefs.networkViewId;
  }

  return getDefaultNetworkViewId(fallbackChainId);
}

let cachedViewId: string | null = null;

export function getNetworkViewId(fallbackChainId = 1): string {
  if (cachedViewId && getDisplayNetworkById(cachedViewId)) return cachedViewId;
  const resolved = resolveInitialNetworkViewId(fallbackChainId);
  cachedViewId = resolved;
  return resolved;
}

export function subscribeNetworkView(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

/** Single source of truth for portfolio network view — updates storage + preferences. */
export function setNetworkViewIdStore(id: string): boolean {
  const network = getDisplayNetworkById(id);
  if (!network) return false;

  cachedViewId = id;
  writeStoredNetworkViewId(id);
  updatePortfolioPreferences({
    networkViewId: id,
    chainId: network.chainId,
  });
  notify();
  return true;
}

export function hydrateNetworkViewStore(fallbackChainId: number): string {
  const id = resolveInitialNetworkViewId(fallbackChainId);
  cachedViewId = id;
  return id;
}
