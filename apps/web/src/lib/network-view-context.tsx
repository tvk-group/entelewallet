'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getDefaultNetworkViewId, getDisplayNetworkById } from '@entelewallet/config';
import { useAccount, useChainId } from 'wagmi';

const NETWORK_VIEW_KEY = 'entelewallet-network-view';

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

type NetworkViewContextValue = {
  networkViewId: string;
  setNetworkViewId: (id: string) => void;
  activeNetwork: ReturnType<typeof getDisplayNetworkById>;
};

const NetworkViewContext = createContext<NetworkViewContextValue | null>(null);

/**
 * Portfolio network view — independent from the wallet's active chain.
 * Switching view is instant (React state); balances load via read-only RPC.
 */
export function NetworkViewProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wasConnectedRef = useRef(isConnected);

  const [networkViewId, setNetworkViewIdState] = useState(() => {
    const stored = readStoredNetworkViewId();
    if (stored && getDisplayNetworkById(stored)) return stored;
    return getDefaultNetworkViewId(chainId);
  });

  const setNetworkViewId = useCallback((id: string) => {
    if (!getDisplayNetworkById(id)) return;
    setNetworkViewIdState(id);
    writeStoredNetworkViewId(id);
  }, []);

  // On first wallet connect only, default view to wallet chain if user has no saved preference.
  useEffect(() => {
    const justConnected = isConnected && !wasConnectedRef.current;
    wasConnectedRef.current = isConnected;

    if (justConnected && !readStoredNetworkViewId()) {
      const next = getDefaultNetworkViewId(chainId);
      setNetworkViewIdState(next);
      writeStoredNetworkViewId(next);
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
