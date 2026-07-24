'use client';

import { notFound } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnectors } from 'wagmi';
import { PageLayout } from '@/components/page-layout';
import { WalletDebugPanel } from '@/components/wallet-debug-panel';
import { WalletErrorBoundary } from '@/components/wallet-error-boundary';
import { isWalletConnectConfigured, walletConnectProjectId } from '@/lib/wagmi';
import {
  describeConnector,
  findAnyWalletConnectConnector,
  getCurrentOrigin,
  isWalletConnectOriginAllowed,
} from '@/lib/walletconnect-utils';
import { useWalletUi } from '@/lib/web3-provider';
import { Alert } from '@entelewallet/ui';

export default function DevWalletConnectTestPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const { address, status, chainId } = useAccount();
  const connectors = useConnectors();
  const { connectError } = useWalletUi();
  const origin = getCurrentOrigin();
  const wc = findAnyWalletConnectConnector(connectors);

  return (
    <PageLayout title="WalletConnect test (dev only)" hideTitle>
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="warning">
          Development-only route. Uses standard RainbowKit ConnectButton — no custom wallet UI.
        </Alert>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2 text-sm">
          <p>origin: {origin || '—'}</p>
          <p>origin allowed: {isWalletConnectOriginAllowed(origin) ? 'yes' : 'no'}</p>
          <p>projectId configured: {isWalletConnectConfigured() ? 'yes' : 'no'}</p>
          <p>projectId present: {walletConnectProjectId ? 'yes' : 'no'}</p>
          <p>wagmi status: {status}</p>
          <p>chain: {chainId ?? '—'}</p>
          <p>address: {address ?? '—'}</p>
          <p>WC connector: {wc ? describeConnector(wc) : 'not found'}</p>
          {connectError && <p className="text-red-700">error: {connectError}</p>}
        </div>

        <WalletErrorBoundary>
          <ConnectButton />
        </WalletErrorBoundary>

        <WalletDebugPanel />
      </div>
    </PageLayout>
  );
}
