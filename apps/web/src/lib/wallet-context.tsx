'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAccount, useChainId } from 'wagmi';
import { isSupportedChain } from '@entelewallet/config';
import type { WalletConnectionRecord, WalletVerificationStatus } from '@entelewallet/types';
import { useAuth } from '@/lib/auth-context';
import { fetchWalletConnections } from '@/lib/wallet-link-api';
import { WalletIdleGuard } from '@/components/wallet-idle-guard';

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

const FLOW_STATUSES = new Set<WalletVerificationStatus>([
  'signature_pending',
  'verification_failed',
]);

function readLocalVerification(address: string): { verifiedAt: string } | null {
  try {
    const stored = localStorage.getItem(`${VERIFIED_KEY}-${address.toLowerCase()}`);
    if (!stored) return null;
    const data = JSON.parse(stored) as { verifiedAt?: string };
    return data.verifiedAt ? { verifiedAt: data.verifiedAt } : null;
  } catch {
    return null;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { user, isLoading: authLoading } = useAuth();
  const [verificationStatus, setVerificationStatusState] =
    useState<WalletVerificationStatus>('disconnected');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [connections, setConnections] = useState<WalletConnectionRecord[]>([]);
  const verificationFlowRef = useRef(false);

  const refreshLinkStatus = useCallback(async () => {
    if (!user || !address) {
      setConnections([]);
      return;
    }

    const data = await fetchWalletConnections(address);
    setConnections(data.connections);

    if (data.walletStatus?.linkedToOtherUser) {
      verificationFlowRef.current = false;
      setVerificationStatusState('linked_to_other_account');
      setLinkedAt(null);
      return;
    }

    const match = data.connections.find(
      (c) => c.walletAddress.toLowerCase() === address.toLowerCase(),
    );

    if (match || data.walletStatus?.linkedToCurrentUser) {
      verificationFlowRef.current = false;
      setVerificationStatusState('linked_to_account');
      setLinkedAt(match?.linkedAt ?? match?.verifiedAt ?? null);
      if (match?.verifiedAt) setVerifiedAt(match.verifiedAt);
      return;
    }
  }, [user, address]);

  const setVerificationStatus = useCallback((status: WalletVerificationStatus) => {
    verificationFlowRef.current = FLOW_STATUSES.has(status);
    setVerificationStatusState(status);
  }, []);

  const markVerified = useCallback(
    (at: string) => {
      verificationFlowRef.current = false;
      setVerifiedAt(at);
      setVerificationStatusState('verified');
      if (address) {
        localStorage.setItem(
          `${VERIFIED_KEY}-${address.toLowerCase()}`,
          JSON.stringify({ verifiedAt: at, chainId }),
        );
      }
      if (user) void refreshLinkStatus();
    },
    [address, chainId, user, refreshLinkStatus],
  );

  const handleSetVerified = useCallback(
    (status: WalletVerificationStatus) => {
      if (status === 'signature_pending' || status === 'verification_failed') {
        setVerificationStatus(status);
        return;
      }

      if (status === 'verified' && address) {
        markVerified(new Date().toISOString());
        return;
      }

      verificationFlowRef.current = false;
      setVerificationStatusState(status);

      if (status === 'linked_to_account') {
        void refreshLinkStatus();
      }
    },
    [address, markVerified, refreshLinkStatus, setVerificationStatus],
  );

  useEffect(() => {
    if (!user || !address || authLoading) return;
    const local = readLocalVerification(address);
    if (!local) return;
    void refreshLinkStatus();
  }, [user, address, authLoading, refreshLinkStatus]);

  useEffect(() => {
    if (!isConnected || !address) {
      verificationFlowRef.current = false;
      setVerificationStatusState('disconnected');
      setVerifiedAt(null);
      setLinkedAt(null);
      setConnections([]);
      return;
    }

    if (verificationFlowRef.current) return;

    if (!isSupportedChain(chainId)) {
      setVerificationStatusState('unsupported_network');
      return;
    }

    let cancelled = false;

    async function resolveStatus() {
      const local = readLocalVerification(address!);
      if (local) {
        if (!cancelled) {
          setVerifiedAt(local.verifiedAt);
          if (!authLoading && user) {
            await refreshLinkStatus();
            if (!cancelled) {
              setVerificationStatusState((current) =>
                current === 'linked_to_account' || current === 'linked_to_other_account'
                  ? current
                  : 'verified',
              );
            }
          } else if (!cancelled) {
            setVerificationStatusState('verified');
          }
        }
        return;
      }

      try {
        const res = await fetch(`/api/wallet/verify?address=${encodeURIComponent(address!)}`, {
          cache: 'no-store',
          credentials: 'include',
        });
        if (res.ok) {
          const data = (await res.json()) as { verified?: boolean; verifiedAt?: string };
          if (data.verified && data.verifiedAt) {
            if (!cancelled) markVerified(data.verifiedAt);
            return;
          }
        }
      } catch {
        // fall through to unverified
      }

      if (!cancelled) {
        setVerificationStatusState('connected_unverified');
        setVerifiedAt(null);
        setLinkedAt(null);
      }
    }

    void resolveStatus();

    return () => {
      cancelled = true;
    };
  }, [isConnected, address, chainId, user, authLoading, markVerified, refreshLinkStatus]);

  return (
    <WalletContext.Provider
      value={{
        verificationStatus,
        setVerificationStatus: handleSetVerified,
        isVerified: verificationStatus === 'verified' || verificationStatus === 'linked_to_account',
        isLinkedToAccount: verificationStatus === 'linked_to_account',
        verifiedAt,
        linkedAt,
        connections,
        refreshLinkStatus,
      }}
    >
      <WalletIdleGuard pauseWhileVerifying={verificationStatus === 'signature_pending'} />
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletStatus() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletStatus must be used within WalletProvider');
  return ctx;
}
