'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAccount, useChainId } from 'wagmi';
import { isSupportedChain } from '@entelewallet/config';
import type { WalletConnectionRecord, WalletVerificationStatus } from '@entelewallet/types';
import { useAuth } from '@/lib/auth-context';
import { fetchWalletConnections } from '@/lib/wallet-link-api';

interface WalletContextValue {
  verificationStatus: WalletVerificationStatus;
  setVerificationStatus: (status: WalletVerificationStatus) => void;
  isVerified: boolean;
  isLinkedToAccount: boolean;
  verifiedAt: string | null;
  linkedAt: string | null;
  connections: WalletConnectionRecord[];
  refreshLinkStatus: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const VERIFIED_KEY = 'entelewallet-verified';

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { user, isLoading: authLoading } = useAuth();
  const [verificationStatus, setVerificationStatus] =
    useState<WalletVerificationStatus>('disconnected');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [connections, setConnections] = useState<WalletConnectionRecord[]>([]);

  const refreshLinkStatus = useCallback(async () => {
    if (!user || !address) {
      setConnections([]);
      return;
    }

    const data = await fetchWalletConnections(address);
    setConnections(data.connections);

    if (data.walletStatus?.linkedToOtherUser) {
      setVerificationStatus('linked_to_other_account');
      setLinkedAt(null);
      return;
    }

    const match = data.connections.find(
      (c) => c.walletAddress.toLowerCase() === address.toLowerCase(),
    );

    if (match || data.walletStatus?.linkedToCurrentUser) {
      setVerificationStatus('linked_to_account');
      setLinkedAt(match?.linkedAt ?? match?.verifiedAt ?? null);
      if (match?.verifiedAt) setVerifiedAt(match.verifiedAt);
      return;
    }
  }, [user, address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setVerificationStatus('disconnected');
      setVerifiedAt(null);
      setLinkedAt(null);
      setConnections([]);
      return;
    }

    if (!isSupportedChain(chainId)) {
      setVerificationStatus('unsupported_network');
      return;
    }

    const stored = localStorage.getItem(`${VERIFIED_KEY}-${address.toLowerCase()}`);
    let locallyVerified = false;
    if (stored) {
      const data = JSON.parse(stored);
      if (data.verifiedAt && data.chainId === chainId) {
        locallyVerified = true;
        setVerifiedAt(data.verifiedAt);
      }
    }

    if (!locallyVerified) {
      setVerificationStatus('connected_unverified');
      setVerifiedAt(null);
      setLinkedAt(null);
      return;
    }

    if (!authLoading && user) {
      void refreshLinkStatus().then(() => {
        setVerificationStatus((current) =>
          current === 'linked_to_account' || current === 'linked_to_other_account'
            ? current
            : 'verified',
        );
      });
      return;
    }

    setVerificationStatus('verified');
  }, [isConnected, address, chainId, user, authLoading, refreshLinkStatus]);

  const handleSetVerified = useCallback(
    (status: WalletVerificationStatus) => {
      setVerificationStatus(status);
      if (status === 'verified' && address) {
        const now = new Date().toISOString();
        setVerifiedAt(now);
        localStorage.setItem(
          `${VERIFIED_KEY}-${address.toLowerCase()}`,
          JSON.stringify({ verifiedAt: now, chainId }),
        );
        if (user) void refreshLinkStatus();
      }
      if (status === 'linked_to_account') {
        void refreshLinkStatus();
      }
    },
    [address, chainId, user, refreshLinkStatus],
  );

  return (
    <WalletContext.Provider
      value={{
        verificationStatus,
        setVerificationStatus: handleSetVerified,
        isVerified:
          verificationStatus === 'verified' || verificationStatus === 'linked_to_account',
        isLinkedToAccount: verificationStatus === 'linked_to_account',
        verifiedAt,
        linkedAt,
        connections,
        refreshLinkStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletStatus() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletStatus must be used within WalletProvider');
  return ctx;
}
