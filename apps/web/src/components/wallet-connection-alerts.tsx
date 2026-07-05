'use client';

import { useAccount } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import { useWalletUi, isWalletConnectConfigured } from '@/lib/web3-provider';
import { getCurrentOrigin, isWalletConnectOriginAllowed } from '@/lib/walletconnect-utils';
import { Alert } from '@entelewallet/ui';
import { isSupportedChain } from '@entelewallet/config';

export function WalletConnectionAlerts() {
  const t = useT();
  const { chainId, isConnected } = useAccount();
  const { connectError, uiState } = useWalletUi();

  const alerts: { variant: 'error' | 'warning' | 'info'; message: string }[] = [];

  if (!isWalletConnectConfigured) {
    alerts.push({
      variant: process.env.NODE_ENV === 'development' ? 'warning' : 'info',
      message:
        process.env.NODE_ENV === 'development'
          ? 'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'
          : t('connect.walletConnectUnavailable'),
    });
  }

  if (
    process.env.NODE_ENV === 'development' &&
    isWalletConnectConfigured &&
    !isWalletConnectOriginAllowed(getCurrentOrigin())
  ) {
    alerts.push({
      variant: 'warning',
      message: `${t('connect.walletConnectOriginBlocked')} (${getCurrentOrigin()})`,
    });
  }

  if (connectError) {
    alerts.push({ variant: 'error', message: `${t('connect.connectionFailed')}: ${connectError}` });
  }

  if (uiState === 'connection_failed' && !connectError) {
    alerts.push({ variant: 'error', message: t('connect.connectionFailed') });
  }

  if (uiState === 'connection_rejected') {
    alerts.push({ variant: 'warning', message: t('connect.walletRejected') });
  }

  if (isConnected && chainId && !isSupportedChain(chainId)) {
    alerts.push({ variant: 'warning', message: t('connect.unsupportedNetwork') });
  }

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <Alert key={`${a.message.slice(0, 40)}-${i}`} variant={a.variant}>
          {a.message}
        </Alert>
      ))}
    </div>
  );
}
