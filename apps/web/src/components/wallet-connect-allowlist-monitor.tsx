'use client';

import { useEffect } from 'react';
import { useT } from '@/lib/i18n-context';
import { getCurrentOrigin } from '@/lib/walletconnect-utils';
import { useWalletUi } from '@/lib/web3-provider';

function isReownAllowlistMessage(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('not found on allowlist') ||
    lower.includes('origin') && lower.includes('allowlist') ||
    lower.includes('cloud.reown.com')
  );
}

/** Surfaces Reown Cloud allowlist errors that otherwise fail silently in production. */
export function WalletConnectAllowlistMonitor() {
  const t = useT();
  const { setConnectError } = useWalletUi();

  useEffect(() => {
    const origin = getCurrentOrigin();
    const message = `${t('connect.walletConnectOriginBlocked')} (${origin}). ${t('connect.walletConnectOriginHint')} https://cloud.reown.com`;

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const text =
        reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : '';
      if (isReownAllowlistMessage(text)) {
        setConnectError(message);
      }
    };

    const onWindowError = (event: ErrorEvent) => {
      if (event.message && isReownAllowlistMessage(event.message)) {
        setConnectError(message);
      }
    };

    const originalConsoleError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const text = args.map((arg) => String(arg)).join(' ');
      if (isReownAllowlistMessage(text)) {
        setConnectError(message);
      }
      originalConsoleError(...args);
    };

    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('error', onWindowError);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('error', onWindowError);
    };
  }, [setConnectError, t]);

  return null;
}
