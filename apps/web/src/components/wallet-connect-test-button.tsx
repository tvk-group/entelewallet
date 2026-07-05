'use client';

import { useState } from 'react';
import { useConnect, useConnectors } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import {
  isWalletConnectConfigured,
  walletConnectProjectId,
} from '@/lib/wagmi';
import {
  findAnyWalletConnectConnector,
  findWalletConnectModalConnector,
  getCurrentOrigin,
  isWalletConnectOriginAllowed,
} from '@/lib/walletconnect-utils';
import { useWalletUi } from '@/lib/web3-provider';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@entelewallet/ui';
import { WALLETCONNECT_ALLOWED_ORIGINS } from '@entelewallet/config';

const QR_OPEN_TIMEOUT_MS = 10_000;

export function WalletConnectTestButton() {
  const t = useT();
  const connectors = useConnectors();
  const { connectAsync, isPending } = useConnect();
  const { setConnectError, setUiState } = useWalletUi();
  const [lastError, setLastError] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  if (process.env.NODE_ENV !== 'development') return null;

  const origin = getCurrentOrigin();
  const originAllowed = isWalletConnectOriginAllowed(origin);
  const modalConnector = findWalletConnectModalConnector(connectors);
  const anyWcConnector = findAnyWalletConnectConnector(connectors);

  async function testWalletConnectQr() {
    setLastError(null);
    setStatusLine(t('connect.testWalletConnectOpening'));
    setConnectError(null);

    if (!isWalletConnectConfigured) {
      const msg = t('connect.walletConnectMissing');
      setLastError(msg);
      setConnectError(msg);
      setStatusLine(null);
      return;
    }

    if (!originAllowed) {
      const msg = t('connect.walletConnectOriginBlocked');
      setLastError(`${msg} (${origin})`);
      setConnectError(msg);
      setStatusLine(null);
      return;
    }

    const connector = modalConnector ?? anyWcConnector;
    if (!connector) {
      const msg = t('connect.testWalletConnectNoConnector');
      setLastError(msg);
      setConnectError(msg);
      setStatusLine(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      setLastError(t('connect.walletConnectQrFailed'));
      setConnectError(t('connect.walletConnectQrFailed'));
      setUiState('connection_failed');
      setStatusLine(null);
    }, QR_OPEN_TIMEOUT_MS);

    try {
      setUiState('connecting');
      await connectAsync({ connector });
      window.clearTimeout(timeout);
      setStatusLine(t('connect.testWalletConnectSuccess'));
      setUiState('connected');
    } catch (err) {
      window.clearTimeout(timeout);
      const message = err instanceof Error ? err.message : t('connect.connectionFailed');
      setLastError(message);
      setConnectError(message);
      setUiState('connection_failed');
      setStatusLine(null);
      console.error('[WalletConnect test]', err);
    }
  }

  return (
    <Card className="border-dashed border-violet-300 bg-violet-50/40">
      <CardHeader>
        <CardTitle className="text-sm text-violet-900">{t('connect.testWalletConnectTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs text-violet-950">
        <p>{t('connect.testWalletConnectDesc')}</p>
        <ul className="space-y-1 font-mono">
          <li>origin: {origin || '—'}</li>
          <li>origin allowed: {originAllowed ? 'yes' : 'no'}</li>
          <li>projectId set: {walletConnectProjectId ? 'yes' : 'no'}</li>
          <li>WC modal connector: {modalConnector ? 'yes' : 'no'}</li>
          <li>WC any connector: {anyWcConnector ? 'yes' : 'no'}</li>
        </ul>
        {!originAllowed && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-900">
            {t('connect.walletConnectOriginHint')}{' '}
            {WALLETCONNECT_ALLOWED_ORIGINS.join(', ')}
          </p>
        )}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => void testWalletConnectQr()}
        >
          {t('connect.testWalletConnectButton')}
        </Button>
        {statusLine && <p className="text-emerald-800">{statusLine}</p>}
        {lastError && <p className="text-red-700">{lastError}</p>}
      </CardContent>
    </Card>
  );
}
