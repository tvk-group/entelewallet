'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent } from '@entelewallet/ui';

export default function DisclaimerPage() {
  const t = useT();
  return (
    <PageLayout title={t('legalPages.disclaimerTitle')} description="">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-sm leading-relaxed text-slate-700">
          {t('legalPages.disclaimerBody')}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
