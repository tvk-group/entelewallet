'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { WalletLinkPanel } from '@/components/wallet-link-panel';
import { useT } from '@/lib/i18n-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { DOMAIN_CONFIG, ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button, Alert } from '@entelewallet/ui';
import { ExternalLink } from 'lucide-react';

export default function VestingPage() {
  const t = useT();
  const { isLinkedToAccount } = useWalletStatus();

  return (
    <PageLayout title={t('vesting.title')} description={t('vesting.description')}>
      <Card>
        <CardContent className="space-y-4 p-8">
          {isLinkedToAccount ? (
            <>
              <Alert variant="info">{t('vesting.linked')}</Alert>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href={DOMAIN_CONFIG.investorAppDashboard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" className="gap-2">
                    {t('vesting.viewSchedule')} <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Link href={ROUTES.roadmap}>
                  <Button variant="ghost">{t('vesting.learnAboutVesting')}</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-slate-600">{t('vesting.notLinked')}</p>
              <div className="mx-auto max-w-md text-left">
                <WalletLinkPanel />
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a href={DOMAIN_CONFIG.investorApp} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="gap-2">
                    {t('common.openInvestorApp')} <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
                <Link href={ROUTES.roadmap}>
                  <Button variant="ghost">{t('vesting.learnAboutVesting')}</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
