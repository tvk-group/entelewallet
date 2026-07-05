'use client';

import { PageLayout } from '@/components/page-layout';
import { PreConnectSafetyPanel } from '@/components/pre-connect-safety';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { WalletVerification } from '@/components/wallet-verification';
import { SignatureWarningBanner, SecurityBanner } from '@/components/security-banner';
import { useT } from '@/lib/i18n-context';
import { isWalletConnectConfigured } from '@/lib/web3-provider';
import { Alert, Card, CardContent } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { useState } from 'react';

export default function ConnectPage() {
  const t = useT();
  const { isConnected } = useAccount();
  const [canConnect, setCanConnect] = useState(false);
  const wcConfigured = isWalletConnectConfigured;

  return (
    <PageLayout title={t('connect.title')} description={t('connect.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PreConnectSafetyPanel onAckChange={setCanConnect} />

        {!wcConfigured && (
          <Alert variant="warning">
            {process.env.NODE_ENV === 'development'
              ? t('connect.walletConnectDevWarning')
              : t('connect.walletConnectUnavailable')}
          </Alert>
        )}

        <SecurityBanner />

        {!isConnected ? (
          <Card className="animate-slide-up">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <WalletConnectButton size="lg" disabled={!canConnect} />
              {!canConnect && (
                <p className="text-center text-sm text-amber-700">{t('connect.ackRequired')}</p>
              )}
              <p className="text-center text-sm text-slate-500">{t('connect.description')}</p>
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
      </div>
    </PageLayout>
  );
}
