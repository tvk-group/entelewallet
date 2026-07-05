'use client';

import { PageLayout } from '@/components/page-layout';
import { SecurityBanner, SignatureWarningBanner } from '@/components/security-banner';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { WalletVerification } from '@/components/wallet-verification';
import { useT } from '@/lib/i18n-context';
import { walletConnectProjectId } from '@/lib/web3-provider';
import { Alert, Card, CardContent } from '@entelewallet/ui';
import { useAccount } from 'wagmi';

export default function ConnectPage() {
  const t = useT();
  const { isConnected } = useAccount();
  const wcMissing = !walletConnectProjectId;

  return (
    <PageLayout title={t('connect.title')} description={t('connect.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <SecurityBanner />

        {wcMissing && process.env.NODE_ENV === 'development' && (
          <Alert variant="warning">{t('connect.walletConnectDevWarning')}</Alert>
        )}

        {!isConnected ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <WalletConnectButton />
              <p className="text-center text-sm text-slate-500">
                {t('connect.description')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <SignatureWarningBanner />
            <Card>
              <CardContent className="p-6">
                <WalletVerification />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
}
