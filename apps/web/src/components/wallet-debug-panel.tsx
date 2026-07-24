'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useConnectors } from 'wagmi';
import { isWalletConnectConfigured, walletConnectProjectId } from '@/lib/wagmi';
import {
  describeConnector,
  findAnyWalletConnectConnector,
  findWalletConnectModalConnector,
  getCurrentOrigin,
  isWalletConnectOriginAllowed,
} from '@/lib/walletconnect-utils';
import { useWalletUi } from '@/lib/web3-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@entelewallet/ui';
import { WALLETCONNECT_ALLOWED_ORIGINS } from '@entelewallet/config';

export function WalletDebugPanel() {
  const connectors = useConnectors();
  const { address, status, chainId, connector } = useAccount();
  const { error: connectError } = useConnect();
  const { connectError: uiError, uiState } = useWalletUi();
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setMounted(true);
    setOrigin(getCurrentOrigin());
  }, []);

  if (process.env.NODE_ENV !== 'development' || !mounted) return null;

  const originAllowed = isWalletConnectOriginAllowed(origin);
  const wcModal = findWalletConnectModalConnector(connectors);
  const wcAny = findAnyWalletConnectConnector(connectors);

  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-sm text-amber-900">Wallet debug (development only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 font-mono text-xs text-amber-950">
        <p>origin: {origin || '—'}</p>
        <p>origin in allowlist: {originAllowed ? 'yes' : 'no'}</p>
        <p>projectId configured: {isWalletConnectConfigured() ? 'yes' : 'no'}</p>
        <p>projectId: {walletConnectProjectId || '—'}</p>
        <p>wagmi status: {status}</p>
        <p>ui state: {uiState}</p>
        <p>chain: {chainId ?? '—'}</p>
        <p>address: {address ?? '—'}</p>
        <p>active connector: {connector ? describeConnector(connector) : '—'}</p>
        <p>WC modal connector: {wcModal ? describeConnector(wcModal) : 'no'}</p>
        <p>WC connector exists: {wcAny ? 'yes' : 'no'}</p>
        <p>connect error: {connectError?.message ?? uiError ?? '—'}</p>
        {!originAllowed && origin && (
          <p className="rounded border border-amber-200 bg-white/70 p-2 font-sans text-[11px] leading-relaxed text-amber-900">
            Current origin is not in the WalletConnect allowlist. Add it in Reown Cloud:{' '}
            {WALLETCONNECT_ALLOWED_ORIGINS.join(', ')}
          </p>
        )}
        <div>
          <p className="mb-1 font-sans font-semibold">Connectors ({connectors.length}):</p>
          <ul className="space-y-1">
            {connectors.map((c) => (
              <li key={c.uid}>{describeConnector(c)}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
