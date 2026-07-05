'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { isSupportedChain } from '@entelewallet/config';
import type { WalletVerificationStatus } from '@entelewallet/types';

interface WalletContextValue {
  verificationStatus: WalletVerificationStatus;
  setVerificationStatus: (status: WalletVerificationStatus) => void;
  isVerified: boolean;
  verifiedAt: string | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const VERIFIED_KEY = 'entelewallet-verified';

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [verificationStatus, setVerificationStatus] =
    useState<WalletVerificationStatus>('disconnected');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setVerificationStatus('disconnected');
      setVerifiedAt(null);
      return;
    }

    if (!isSupportedChain(chainId)) {
      setVerificationStatus('unsupported_network');
      return;
    }

    const stored = localStorage.getItem(`${VERIFIED_KEY}-${address.toLowerCase()}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.verifiedAt && data.chainId === chainId) {
        setVerificationStatus('verified');
        setVerifiedAt(data.verifiedAt);
        return;
      }
    }

    setVerificationStatus('connected_unverified');
    setVerifiedAt(null);
  }, [isConnected, address, chainId]);

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
      }
    },
    [address, chainId],
  );

  return (
    <WalletContext.Provider
      value={{
        verificationStatus,
        setVerificationStatus: handleSetVerified,
        isVerified: verificationStatus === 'verified',
        verifiedAt,
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
