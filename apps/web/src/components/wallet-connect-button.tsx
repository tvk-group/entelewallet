'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import { useWalletUi } from '@/lib/web3-provider';
import { isPreConnectAcknowledged } from '@/components/pre-connect-safety';
import { PreConnectSafetyModal } from '@/components/pre-connect-safety-modal';
import { cn, truncateAddress } from '@entelewallet/utils';
import { Button } from '@entelewallet/ui';

const CONNECT_TIMEOUT_MS = 30_000;

interface WalletConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  /** When true, parent controls ack gate (e.g. /connect page checkbox). */
  skipAckRedirect?: boolean;
}

function mapConnectError(message: string, t: (k: string) => string): string {
  const lower = message.toLowerCase();
  if (lower.includes('rejected') || lower.includes('denied') || lower.includes('cancel')) {
    return t('connect.walletRejected');
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return t('connect.connectionTimedOut');
  }
  if (lower.includes('base account') || lower.includes('baseaccount')) {
    return t('connect.baseDisabled');
  }
  if (
    lower.includes('no wallet') ||
    lower.includes('not found') ||
    lower.includes('not available') ||
    lower.includes('provider')
  ) {
    return t('connect.walletUnavailable');
  }
  if (lower.includes('origin') || lower.includes('allowlist') || lower.includes('403')) {
    return t('connect.walletConnectOriginBlocked');
  }
  if (lower.includes('project id') || lower.includes('projectid')) {
    return t('connect.walletConnectMissing');
  }
  return message;
}

function SafetyGatedConnectTrigger({
  disabled,
  className,
  skipAckRedirect,
  openConnectModal,
  connectModalOpen,
  mounted,
}: WalletConnectButtonProps & {
  openConnectModal: () => void;
  connectModalOpen: boolean;
  mounted: boolean;
}) {
  const t = useT();
  const { isConnected, isConnecting, status } = useAccount();
  const { error: connectError, isPending: connectPending } = useConnect();
  const { setUiState, connectError: uiError, setConnectError } = useWalletUi();

  const [acknowledged, setAcknowledged] = useState(false);
  const [userStartedConnect, setUserStartedConnect] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyAcked, setSafetyAcked] = useState(false);
  const [hadFailure, setHadFailure] = useState(false);
  const openModalRef = useRef<(() => void) | null>(null);

  const wagmiConnecting = status === 'connecting' || isConnecting || connectPending;
  const showConnectingLabel = userStartedConnect && wagmiConnecting;

  useEffect(() => {
    setAcknowledged(isPreConnectAcknowledged());
  }, []);

  useEffect(() => {
    if (isConnected) {
      setUserStartedConnect(false);
      setHadFailure(false);
      setUiState('connected');
      return;
    }
    if (showSafetyModal) {
      setUiState('safety_required');
      return;
    }
    if (userStartedConnect && (wagmiConnecting || connectModalOpen)) {
      setUiState(wagmiConnecting ? 'connecting' : 'modal_open');
      return;
    }
    if (hadFailure) {
      setUiState('connection_failed');
      return;
    }
    setUiState('idle');
  }, [
    isConnected,
    wagmiConnecting,
    connectModalOpen,
    userStartedConnect,
    showSafetyModal,
    hadFailure,
    setUiState,
  ]);

  useEffect(() => {
    if (!connectError || !userStartedConnect) return;
    const mapped = mapConnectError(connectError.message, t);
    setConnectError(mapped);
    setUiState(
      connectError.message.toLowerCase().includes('reject') ||
        connectError.message.toLowerCase().includes('denied')
        ? 'connection_rejected'
        : 'connection_failed',
    );
    setUserStartedConnect(false);
    setHadFailure(true);
  }, [connectError, userStartedConnect, setConnectError, setUiState, t]);

  useEffect(() => {
    if (!userStartedConnect || !wagmiConnecting) return;
    const timer = window.setTimeout(() => {
      setUserStartedConnect(false);
      setHadFailure(true);
      setConnectError(t('connect.connectionTimedOut'));
      setUiState('connection_failed');
    }, CONNECT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [userStartedConnect, wagmiConnecting, setConnectError, setUiState, t]);

  const beginConnect = useCallback(
    (open: () => void) => {
      setConnectError(null);
      setHadFailure(false);
      setUserStartedConnect(true);
      setUiState('modal_open');
      try {
        open();
      } catch (err) {
        setUserStartedConnect(false);
        setHadFailure(true);
        const message = err instanceof Error ? err.message : t('connect.modalUnavailable');
        setConnectError(mapConnectError(message, t));
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
  const getButtonLabel = () => {
    if (showConnectingLabel) return t('connect.connecting');
    if (showSafetyModal && !skipAckRedirect) return t('connect.reviewSafetyNotice');
    if (hadFailure || uiError) return t('connect.tryAgain');
    return t('common.connectWallet');
  };

  return (
    <>
      <div
        {...(!ready && {
          'aria-hidden': true,
          style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
        })}
      >
        <button
          type="button"
          disabled={disabled || showConnectingLabel}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleConnectClick();
          }}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-800 via-cyan-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-50',
            className,
          )}
        >
          {getButtonLabel()}
        </button>
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

/** Uses RainbowKit's standard ConnectButton when safety is already acknowledged. */
export function WalletConnectButton(props: WalletConnectButtonProps) {
  const t = useT();
  const { isConnected, address } = useAccount();
  const { skipAckRedirect, disabled, className } = props;
  const [useStandardButton, setUseStandardButton] = useState(false);

  useEffect(() => {
    setUseStandardButton(
      !disabled && (skipAckRedirect || isPreConnectAcknowledged()),
    );
  }, [disabled, skipAckRedirect]);

  if (isConnected) {
    return (
      <ConnectButton.Custom>
        {({ account, openAccountModal, mounted }) => (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
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
              {t('connect.connectedLabel')}:{' '}
              {address ? truncateAddress(address) : account?.displayName}
            </button>
          </div>
        )}
      </ConnectButton.Custom>
    );
  }

  if (useStandardButton) {
    return (
      <div className={cn('wallet-connect-rk-button', className)}>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="full" />
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, connectModalOpen, mounted }) => (
        <SafetyGatedConnectTrigger
          {...props}
          openConnectModal={openConnectModal}
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
