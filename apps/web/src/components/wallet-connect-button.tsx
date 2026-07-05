'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n-context';
import { useWalletUi } from '@/lib/web3-provider';
import { isPreConnectAcknowledged } from '@/components/pre-connect-safety';
import { ROUTES } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useEffect, useState } from 'react';

interface WalletConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  /** When true, parent controls ack gate (e.g. /connect page checkbox). */
  skipAckRedirect?: boolean;
}

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

function mapConnectError(message: string, t: (k: string) => string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rejected') || lower.includes('denied') || lower.includes('cancel')) {
    return t('connect.walletRejected');
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return t('connect.connectionTimedOut');
  }
  if (lower.includes('no wallet') || lower.includes('not found') || lower.includes('provider')) {
    return t('connect.noWalletDetected');
  }
  return message;
}

export function WalletConnectButton({
  size = 'md',
  disabled,
  className,
  skipAckRedirect = false,
}: WalletConnectButtonProps) {
  const t = useT();
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const { error: connectError } = useConnect();
  const { setUiState, setConnectError } = useWalletUi();
  const [ackReady, setAckReady] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    setAcknowledged(isPreConnectAcknowledged());
    setAckReady(true);
  }, []);

  useEffect(() => {
    if (isConnecting) setUiState('connecting');
    else if (isConnected) setUiState('connected');
    else setUiState('idle');
  }, [isConnected, isConnecting, setUiState]);

  useEffect(() => {
    if (connectError) {
      setConnectError(mapConnectError(connectError.message, t));
      setUiState('connection_failed');
    }
  }, [connectError, setConnectError, setUiState, t]);

  const handleConnectClick = (openConnectModal: () => void) => {
    if (!skipAckRedirect && ackReady && !acknowledged) {
      router.push(ROUTES.connect);
      return;
    }
    setConnectError(null);
    setUiState('wallet_modal_open');
    try {
      openConnectModal();
    } catch {
      setConnectError(t('connect.modalUnavailable'));
      setUiState('connection_failed');
    }
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {connected ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openAccountModal();
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm backdrop-blur transition hover:shadow-md',
                  className,
                )}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {account.displayName}
              </button>
            ) : (
              <button
                type="button"
                disabled={disabled || isConnecting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConnectClick(openConnectModal);
                }}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-800 via-cyan-600 to-violet-600 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50',
                  sizeClasses[size],
                  className,
                )}
              >
                {isConnecting ? t('connect.connecting') : t('common.connectWallet')}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
