'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Alert, Card, CardContent, LtrSpan } from '@entelewallet/ui';

const DOMAINS = [
  { domain: 'app.entelewallet.com', key: 'officialDomains.app' },
  { domain: 'entelewallet.com', key: 'officialDomains.marketing' },
  { domain: 'entelewallet.app', key: 'officialDomains.appRedirect' },
  { domain: 'entelewallet.org', key: 'officialDomains.trust' },
  { domain: 'wallet.entelekron.io', key: 'officialDomains.ecosystemShortcut' },
  { domain: 'entelekron.io', key: 'officialDomains.entelekron' },
  { domain: 'entelekron.app', key: 'officialDomains.investorApp' },
  { domain: 'tvk.group', key: 'officialDomains.tvkGroup' },
];

export default function OfficialDomainsPage() {
  const t = useT();

  return (
    <PageLayout title={t('officialDomains.title')} description={t('officialDomains.description')}>
      <Alert variant="warning" className="mb-6">
        {t('officialDomains.warning')}
      </Alert>
      <div className="grid gap-3">
        {DOMAINS.map((d) => (
          <Card key={d.domain}>
            <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <LtrSpan className="font-mono text-sm font-medium text-cyan-800">{d.domain}</LtrSpan>
              <span className="text-sm text-slate-600">{t(d.key)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
