'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { DOMAIN_CONFIG, ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button } from '@entelewallet/ui';
import { ExternalLink } from 'lucide-react';

export default function VestingPage() {
  const t = useT();

  return (
    <PageLayout title={t('vesting.title')} description={t('vesting.description')}>
      <Card>
        <CardContent className="space-y-4 p-8 text-center">
          <p className="text-slate-600">{t('vesting.notLinked')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={DOMAIN_CONFIG.investorAppDashboard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" className="gap-2">
                {t('common.linkInvestorAccount')} <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href={DOMAIN_CONFIG.investorApp} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                {t('common.openInvestorApp')} <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Link href={ROUTES.roadmap}>
              <Button variant="ghost">{t('vesting.learnAboutVesting')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
