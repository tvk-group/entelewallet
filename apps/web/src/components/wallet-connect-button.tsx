'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useT } from '@/lib/i18n-context';
import { isPreConnectAcknowledged } from '@/components/pre-connect-safety';
import { PreConnectSafetyModal } from '@/components/pre-connect-safety-modal';
import { WalletErrorBoundary } from '@/components/wallet-error-boundary';
import { cn } from '@entelewallet/utils';

interface WalletConnectButtonProps {
  disabled?: boolean;
  className?: string;
  /** When true, parent controls ack gate (e.g. /connect page checkbox). */
  skipAckRedirect?: boolean;
}

/**
 * Standard RainbowKit ConnectButton only.
 * Custom wallet list / manual connector calls are intentionally not used here.
 */
export function WalletConnectButton({
  disabled,
  className,
  skipAckRedirect,
}: WalletConnectButtonProps) {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safetyAcked, setSafetyAcked] = useState(false);
  const [readyToConnect, setReadyToConnect] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReadyToConnect(skipAckRedirect === true || isPreConnectAcknowledged());
  }, [skipAckRedirect]);

  if (!mounted) {
    return (
      <div
        className={cn('inline-block h-10 min-w-[8rem] rounded-xl bg-slate-100', className)}
        aria-hidden
      />
    );
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'inline-flex h-10 items-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500',
          className,
        )}
      >
        {t('common.connectWallet')}
      </button>
    );
  }

  if (!readyToConnect) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setSafetyAcked(false);
            setSafetyOpen(true);
          }}
          className={cn(
            'inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-blue-800 via-cyan-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg',
            className,
          )}
        >
          {t('common.connectWallet')}
        </button>
        <PreConnectSafetyModal
          open={safetyOpen}
          onClose={() => setSafetyOpen(false)}
          acknowledged={safetyAcked}
          onAckChange={setSafetyAcked}
          onContinue={() => {
            if (!safetyAcked) return;
            setSafetyOpen(false);
            setReadyToConnect(true);
          }}
        />
      </>
    );
  }

  return (
    <WalletErrorBoundary
      fallbackTitle={t('connect.connectionFailed')}
      fallbackMessage={t('connect.walletConnectQrFailed')}
    >
      <div className={cn('wallet-connect-rk-button', className)}>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      </div>
    </WalletErrorBoundary>
  );
}

export function ResetWalletUiButton({ className }: { className?: string }) {
  const t = useT();

  return (
    <button
      type="button"
      className={cn('text-sm text-slate-500 underline hover:text-slate-800', className)}
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
    </button>
  );
}
