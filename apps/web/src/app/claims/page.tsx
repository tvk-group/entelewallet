'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { isFeatureEnabled } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Alert } from '@entelewallet/ui';
import { Circle } from 'lucide-react';

export default function ClaimsPage() {
  const t = useT();
  const claimsEnabled = isFeatureEnabled('ENABLE_CLAIMS');

  const requirements = [
    t('claims.reqVerifiedWallet'),
    t('claims.reqInvestorAccount'),
    t('claims.reqKyc'),
    t('claims.reqAllocation'),
    t('claims.reqClaimContract'),
    t('claims.reqClaimPeriod'),
  ];

  return (
    <PageLayout title={t('claims.title')} description={t('claims.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="warning">{t('claims.notOpen')}</Alert>

        <Card>
          <CardHeader>
            <CardTitle>{t('claims.requirementsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-center gap-3 text-sm text-slate-600">
                  <Circle className="h-4 w-4 text-slate-300" />
                  {req}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {claimsEnabled && (
          <Alert variant="info">
            Claims feature flag is enabled but claim contract is not configured.
          </Alert>
        )}
      </div>
    </PageLayout>
  );
}
