'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent } from '@entelewallet/ui';

export default function RiskPage() {
  const t = useT();
  return (
    <PageLayout title={t('legalPages.riskTitle')} description="">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-sm leading-relaxed text-slate-700">
          {t('legalPages.riskBody')}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
