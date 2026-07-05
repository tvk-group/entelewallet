'use client';

import { PageLayout } from '@/components/page-layout';
import { PreConnectSafetyPanel } from '@/components/pre-connect-safety';
import { WalletConnectButton, ResetWalletUiButton } from '@/components/wallet-connect-button';
import { WalletConnectionAlerts } from '@/components/wallet-connection-alerts';
import { WalletConnectGuide } from '@/components/wallet-connect-guide';
import { WalletDebugPanel } from '@/components/wallet-debug-panel';
import { WalletVerification } from '@/components/wallet-verification';
import { SignatureWarningBanner, SecurityBanner } from '@/components/security-banner';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import Link from 'next/link';

export default function ConnectPage() {
  const t = useT();
  const { isConnected } = useAccount();
  const [canConnect, setCanConnect] = useState(false);

  return (
    <PageLayout title={t('connect.title')} description={t('connect.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <WalletConnectGuide />

        <PreConnectSafetyPanel onAckChange={setCanConnect} />

        <WalletConnectionAlerts />

        <div className="flex justify-end">
          <ResetWalletUiButton />
        </div>

        <SecurityBanner />

        {!isConnected ? (
          <Card className="animate-slide-up">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <WalletConnectButton disabled={!canConnect} skipAckRedirect />
              {!canConnect && (
                <p className="text-center text-sm text-amber-700">{t('connect.ackRequired')}</p>
              )}
              <p className="text-center text-sm text-slate-500">{t('connect.description')}</p>
              {process.env.NODE_ENV === 'development' && (
                <Link
                  href="/dev/walletconnect-test"
                  className="text-xs text-violet-700 underline hover:text-violet-900"
                >
                  Dev: WalletConnect test route
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <SignatureWarningBanner />
            <Card>
              <CardContent className="p-6">
                <WalletVerification />
              </CardContent>
            </Card>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && <WalletDebugPanel />}
      </div>
    </PageLayout>
  );
}
