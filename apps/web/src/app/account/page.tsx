'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LtrSpan } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { truncateAddress } from '@entelewallet/utils';

export default function AccountPage() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const { isVerified } = useWalletStatus();

  const accountState = !isConnected
    ? t('account.guest')
    : isVerified
      ? t('account.verifiedWallet')
      : t('account.connectedWallet');

  return (
    <PageLayout title={t('account.title')} description={t('account.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('account.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Status:</span>
              <Badge variant={isVerified ? 'success' : 'info'}>{accountState}</Badge>
            </div>

            {isConnected && address && (
              <div>
                <p className="text-sm text-slate-500">{t('account.linkedWallets')}</p>
                <LtrSpan className="font-mono text-sm">{truncateAddress(address)}</LtrSpan>
              </div>
            )}

            {!isVerified && isConnected && (
              <p className="text-sm text-amber-700">{t('connect.notLinked')}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary">{t('common.createAccount')}</Button>
              <Button variant="secondary">{t('common.signIn')}</Button>
              <Button variant="outline">{t('common.linkInvestorAccount')}</Button>
              <Link href={ROUTES.support}>
                <Button variant="ghost">{t('common.contactSupport')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
