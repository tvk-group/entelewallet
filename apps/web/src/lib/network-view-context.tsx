'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { getDefaultNetworkViewId, getDisplayNetworkById } from '@entelewallet/config';
import { useAccount, useChainId } from 'wagmi';
import {
  getNetworkViewId,
  hydrateNetworkViewStore,
  setNetworkViewIdStore,
  subscribeNetworkView,
} from '@/lib/network-view-store';

type NetworkViewContextValue = {
  networkViewId: string;
  setNetworkViewId: (id: string) => void;
  activeNetwork: ReturnType<typeof getDisplayNetworkById>;
};

const NetworkViewContext = createContext<NetworkViewContextValue | null>(null);

function readStoredNetworkViewId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('entelewallet-network-view');
  } catch {
    return null;
  }
}

/**
 * Portfolio network view — independent from the wallet's active chain.
 * Uses a shared external store so header, assets grid, and portfolio stay in sync.
 */
export function NetworkViewProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wasConnectedRef = useRef(isConnected);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    hydrateNetworkViewStore(chainId);
  }, [chainId]);

  const networkViewId = useSyncExternalStore(
    subscribeNetworkView,
    () => getNetworkViewId(chainId),
    () => getDefaultNetworkViewId(1),
  );

  const setNetworkViewId = useCallback((id: string) => {
    setNetworkViewIdStore(id);
  }, []);

  // On first wallet connect only, default view to wallet chain if user has no saved preference.
  useEffect(() => {
    const justConnected = isConnected && !wasConnectedRef.current;
    wasConnectedRef.current = isConnected;

    if (justConnected && !readStoredNetworkViewId()) {
      const next = getDefaultNetworkViewId(chainId);
      setNetworkViewIdStore(next);
    }
  }, [isConnected, chainId]);

  const activeNetwork = useMemo(
    () => getDisplayNetworkById(networkViewId),
    [networkViewId],
  );

  const value = useMemo(
    () => ({ networkViewId, setNetworkViewId, activeNetwork }),
    [networkViewId, setNetworkViewId, activeNetwork],
  );

  return (
    <NetworkViewContext.Provider value={value}>{children}</NetworkViewContext.Provider>
  );
}

export function useNetworkView() {
  const ctx = useContext(NetworkViewContext);
  if (!ctx) {
    throw new Error('useNetworkView must be used within NetworkViewProvider');
  }
  return ctx;
}
