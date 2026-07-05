'use client';

import { useConnectors, useAccount } from 'wagmi';
import { isWalletConnectConfigured, walletConnectProjectId } from '@/lib/web3-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@entelewallet/ui';

export function WalletDebugPanel() {
  const connectors = useConnectors();
  const { address, status, chainId, connector } = useAccount();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Card className="border-dashed border-amber-300 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="text-sm text-amber-900">Wallet debug (development only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 font-mono text-xs text-amber-950">
        <p>WalletConnect Project ID: {walletConnectProjectId ? 'yes' : 'no'}</p>
        <p>WC configured: {isWalletConnectConfigured ? 'yes' : 'no'}</p>
        <p>Status: {status}</p>
        <p>Chain: {chainId ?? '—'}</p>
        <p>Address: {address ?? '—'}</p>
        <p>Connector: {connector?.name ?? '—'} ({connector?.id ?? '—'})</p>
        <div>
          <p className="mb-1 font-sans font-semibold">Connectors ({connectors.length}):</p>
          <ul className="space-y-1">
            {connectors.map((c) => (
              <li key={c.uid}>
                {c.name} · id={c.id} · type={c.type}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
