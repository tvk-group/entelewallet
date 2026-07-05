'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import { useWalletUi } from '@/lib/web3-provider';
import { isPreConnectAcknowledged } from '@/components/pre-connect-safety';
import { PreConnectSafetyModal } from '@/components/pre-connect-safety-modal';
import { cn } from '@entelewallet/utils';
import { Button } from '@entelewallet/ui';

const CONNECT_TIMEOUT_MS = 30_000;

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

function ConnectButtonInner({
  size,
  disabled,
  className,
  skipAckRedirect,
  account,
  chain,
  openConnectModal,
  openAccountModal,
  connectModalOpen,
  mounted,
}: WalletConnectButtonProps & {
  account: { displayName: string } | undefined;
  chain: { id: number; name?: string } | undefined;
  openConnectModal: () => void;
  openAccountModal: () => void;
  connectModalOpen: boolean;
  mounted: boolean;
}) {
  const t = useT();
  const { isConnected, isConnecting, status } = useAccount();
  const { error: connectError, isPending: connectPending } = useConnect();
  const { setUiState, setConnectError } = useWalletUi();

  const [acknowledged, setAcknowledged] = useState(false);
  const [userStartedConnect, setUserStartedConnect] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyAcked, setSafetyAcked] = useState(false);
  const openModalRef = useRef<(() => void) | null>(null);

  const wagmiConnecting =
    status === 'connecting' || isConnecting || connectPending;

  const showConnectingLabel = userStartedConnect && wagmiConnecting;

  useEffect(() => {
    setAcknowledged(isPreConnectAcknowledged());
  }, []);

  useEffect(() => {
    if (isConnected) {
      setUserStartedConnect(false);
      setUiState('connected');
      return;
    }
    if (userStartedConnect && wagmiConnecting) {
      setUiState('connecting');
      return;
    }
    if (userStartedConnect) {
      setUiState('wallet_modal_open');
      return;
    }
    setUiState('idle');
  }, [isConnected, wagmiConnecting, userStartedConnect, setUiState]);

  useEffect(() => {
    if (!connectError || !userStartedConnect) return;
    setConnectError(mapConnectError(connectError.message, t));
    setUiState('connection_failed');
    setUserStartedConnect(false);
  }, [connectError, userStartedConnect, setConnectError, setUiState, t]);

  useEffect(() => {
    if (!userStartedConnect || !wagmiConnecting) return;
    const timer = window.setTimeout(() => {
      setUserStartedConnect(false);
      setConnectError(t('connect.connectionTimedOut'));
      setUiState('connection_failed');
    }, CONNECT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [userStartedConnect, wagmiConnecting, setConnectError, setUiState, t]);

  useEffect(() => {
    if (userStartedConnect && !connectModalOpen && !isConnected && !wagmiConnecting) {
      setUserStartedConnect(false);
    }
  }, [connectModalOpen, isConnected, wagmiConnecting, userStartedConnect]);

  const beginConnect = useCallback(
    (open: () => void) => {
      setConnectError(null);
      setUserStartedConnect(true);
      setUiState('wallet_modal_open');
      try {
        open();
      } catch {
        setUserStartedConnect(false);
        setConnectError(t('connect.modalUnavailable'));
        setUiState('connection_failed');
      }
    },
    [setConnectError, setUiState, t],
  );

  const handleConnectClick = () => {
    if (disabled) return;
    const ack = skipAckRedirect ? true : acknowledged;
    if (!ack) {
      openModalRef.current = openConnectModal;
      setSafetyAcked(false);
      setShowSafetyModal(true);
      return;
    }
    beginConnect(openConnectModal);
  };

  const handleSafetyContinue = () => {
    if (!safetyAcked) return;
    setAcknowledged(true);
    setShowSafetyModal(false);
    const open = openModalRef.current;
    openModalRef.current = null;
    if (open) beginConnect(open);
  };

  const ready = mounted;
  const connected = ready && account && chain;

  return (
    <>
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
            {account!.displayName}
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled || showConnectingLabel}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConnectClick();
            }}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-800 via-cyan-600 to-violet-600 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50',
              sizeClasses[size ?? 'md'],
              className,
            )}
          >
            {showConnectingLabel ? t('connect.connecting') : t('common.connectWallet')}
          </button>
        )}
      </div>

      {!skipAckRedirect && (
        <PreConnectSafetyModal
          open={showSafetyModal}
          onClose={() => {
            setShowSafetyModal(false);
            openModalRef.current = null;
          }}
          acknowledged={safetyAcked}
          onAckChange={setSafetyAcked}
          onContinue={handleSafetyContinue}
        />
      )}
    </>
  );
}

export function WalletConnectButton(props: WalletConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, connectModalOpen, mounted }) => (
        <ConnectButtonInner
          {...props}
          account={account}
          chain={chain}
          openConnectModal={openConnectModal}
          openAccountModal={openAccountModal}
          connectModalOpen={connectModalOpen}
          mounted={mounted}
        />
      )}
    </ConnectButton.Custom>
  );
}

export function ResetWalletUiButton({ className }: { className?: string }) {
  const t = useT();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => {
        if (typeof window === 'undefined') return;
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith('wagmi') ||
              key.includes('walletconnect') ||
              key.includes('rk-') ||
              key.includes('rainbowkit') ||
              key.includes('WALLETCONNECT'))
          ) {
            keys.push(key);
          }
        }
        keys.forEach((k) => localStorage.removeItem(k));
        window.location.reload();
      }}
    >
      {t('connect.resetWalletState')}
    </Button>
  );
}
