'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent } from '@entelewallet/ui';

function LegalTemplate({ titleKey, bodyKey }: { titleKey: string; bodyKey: string }) {
  const t = useT();
  return (
    <PageLayout title={t(titleKey)} description="">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-sm leading-relaxed text-slate-700">
          {t(bodyKey)}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default function TermsPage() {
  return <LegalTemplate titleKey="legalPages.termsTitle" bodyKey="legalPages.termsBody" />;
}
