import { getDefaultNetworkViewId, getDisplayNetworkById } from '@entelewallet/config';
import { readPortfolioPreferences, updatePortfolioPreferences } from '@/lib/portfolio-preferences';

const NETWORK_VIEW_KEY = 'entelewallet-network-view';

const listeners = new Set<() => void>();

let currentViewId: string | null = null;

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

function ensureInitialized(fallbackChainId = 1): string {
  if (currentViewId && getDisplayNetworkById(currentViewId)) {
    return currentViewId;
  }
  const resolved = resolveInitialNetworkViewId(fallbackChainId);
  currentViewId = resolved;
  return resolved;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function handleStorageEvent(event: StorageEvent): void {
  if (event.key !== NETWORK_VIEW_KEY && event.key !== null) return;
  const stored = readStoredNetworkViewId();
  if (!stored || !getDisplayNetworkById(stored)) return;
  if (stored === currentViewId) return;
  currentViewId = stored;
  notify();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', handleStorageEvent);
}

export function getNetworkViewId(fallbackChainId = 1): string {
  return ensureInitialized(fallbackChainId);
}

export function subscribeNetworkView(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Single source of truth for portfolio network view — updates storage + preferences. */
export function setNetworkViewIdStore(id: string): boolean {
  const network = getDisplayNetworkById(id);
  if (!network) return false;

  currentViewId = id;
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
  const changed = currentViewId !== id;
  currentViewId = id;
  if (changed) {
    notify();
  }
  return id;
}

export function hasExplicitNetworkViewSelection(): boolean {
  return Boolean(readStoredNetworkViewId() && getDisplayNetworkById(readStoredNetworkViewId()!));
}
