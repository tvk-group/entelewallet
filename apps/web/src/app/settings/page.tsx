'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { SecurityBanner } from '@/components/security-banner';
import { WalletLinkPanel } from '@/components/wallet-link-panel';
import { useT } from '@/lib/i18n-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { unlinkWalletFromAccount } from '@/lib/wallet-link-api';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LtrSpan } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { getVerificationBadgeKey } from '@entelewallet/wallet-core';
import { truncateAddress } from '@entelewallet/utils';
import { PortfolioSettingsCard } from '@/components/portfolio/portfolio-settings-card';

export default function SettingsPage() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const {
    verificationStatus,
    verifiedAt,
    isLinkedToAccount,
    refreshLinkStatus,
    setVerificationStatus,
  } = useWalletStatus();
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  async function handleUnlink() {
    if (!address) return;
    setUnlinking(true);
    const ok = await unlinkWalletFromAccount(address);
    setUnlinking(false);
    if (ok) {
      setShowUnlinkConfirm(false);
      setVerificationStatus('verified');
      await refreshLinkStatus();
    }
  }

  if (!isConnected) {
    return (
      <PageLayout title={t('settings.title')} description={t('settings.description')}>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">{t('common.noWalletConnected')}</p>
            <Link href={ROUTES.connect} className="mt-4 inline-block">
              <Button>{t('common.goToConnect')}</Button>
            </Link>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('settings.title')} description={t('settings.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <SecurityBanner />

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.connectedWallets')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <LtrSpan className="font-mono text-sm">{truncateAddress(address!)}</LtrSpan>
                <div className="mt-1 flex gap-2">
                  <Badge variant="info">{t('settings.setPrimary')}</Badge>
                  <Badge
                    variant={
                      isLinkedToAccount || verificationStatus === 'verified' ? 'success' : 'warning'
                    }
                  >
                    {t(getVerificationBadgeKey(verificationStatus))}
                  </Badge>
                </div>
              </div>
            </div>

            {verifiedAt && (
              <p className="text-sm text-slate-500">
                {t('settings.lastVerified')}:{' '}
                <LtrSpan>{new Date(verifiedAt).toLocaleString()}</LtrSpan>
              </p>
            )}

            <WalletLinkPanel compact />

            {isLinkedToAccount &&
              (!showUnlinkConfirm ? (
                <Button variant="danger" size="sm" onClick={() => setShowUnlinkConfirm(true)}>
                  {t('settings.unlinkWallet')}
                </Button>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-800">{t('settings.unlinkConfirm')}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => void handleUnlink()}
                      disabled={unlinking}
                    >
                      {unlinking ? t('common.loading') : t('common.confirm')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowUnlinkConfirm(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <PortfolioSettingsCard />
      </div>
    </PageLayout>
  );
}
