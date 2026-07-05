'use client';

import { PageLayout } from '@/components/page-layout';
import { SecurityBanner } from '@/components/security-banner';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@entelewallet/ui';

export default function LegalPage() {
  const t = useT();

  const sections = [
    { title: t('legal.noCustody'), detail: t('legal.noCustodyDetail') },
    { title: t('legal.noFinancialAdvice'), detail: t('legal.noFinancialAdviceDetail') },
    { title: t('legal.noGuarantee'), detail: t('legal.noGuaranteeDetail') },
    { title: t('legal.userResponsibility'), detail: t('legal.userResponsibilityDetail') },
    { title: t('legal.cryptoRisk'), detail: t('legal.cryptoRiskDetail') },
    { title: t('legal.jurisdiction'), detail: t('legal.jurisdictionDetail') },
    { title: t('legal.futureFeatures'), detail: t('legal.futureFeaturesDetail') },
  ];

  return (
    <PageLayout title={t('legal.title')} description={t('legal.description')}>
      <div className="mx-auto max-w-3xl space-y-6">
        <SecurityBanner />

        <Card className="border-slate-300">
          <CardContent className="p-6">
            <p className="text-sm leading-relaxed text-slate-700">{t('legal.disclaimer')}</p>
          </CardContent>
        </Card>

        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{section.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
