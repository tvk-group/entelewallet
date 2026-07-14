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

type NetworkViewContextValue = {
  networkViewId: string;
  setNetworkViewId: (id: string) => void;
  activeNetwork: ReturnType<typeof getDisplayNetworkById>;
};

const NetworkViewContext = createContext<NetworkViewContextValue | null>(null);

export function NetworkViewProvider({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [networkViewId, setNetworkViewIdState] = useState(() => getDefaultNetworkViewId(chainId));
  const lastChainIdRef = useRef(chainId);

  useEffect(() => {
    if (lastChainIdRef.current === chainId) return;
    lastChainIdRef.current = chainId;
    setNetworkViewIdState(getDefaultNetworkViewId(chainId));
  }, [chainId]);

  useEffect(() => {
    if (!isConnected) {
      setNetworkViewIdState(getDefaultNetworkViewId(chainId));
    }
  }, [isConnected, chainId]);

  const setNetworkViewId = useCallback((id: string) => {
    setNetworkViewIdState(id);
  }, []);

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
