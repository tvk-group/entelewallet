'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Alert, Card, CardContent, LtrSpan } from '@entelewallet/ui';
import {
  CANONICAL_APP_URL,
  APP_ALIAS_URL,
} from '@entelewallet/config';

const DOMAINS = [
  { domain: 'entelewallet.app', key: 'officialDomains.app', primary: true },
  { domain: 'app.entelewallet.com', key: 'officialDomains.appAlias', alias: true },
  { domain: 'entelewallet.com', key: 'officialDomains.marketing' },
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
      <p className="mb-4 text-sm text-slate-600">
        Primary app: <LtrSpan className="font-mono text-cyan-800">{CANONICAL_APP_URL}</LtrSpan>
        {' · '}
        Alias: <LtrSpan className="font-mono text-slate-600">{APP_ALIAS_URL}</LtrSpan>
      </p>
      <div className="grid gap-3">
        {DOMAINS.map((d) => (
          <Card key={d.domain} className={'primary' in d && d.primary ? 'border-cyan-300 bg-cyan-50/30' : ''}>
            <CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <LtrSpan className="font-mono text-sm font-semibold text-slate-900">{d.domain}</LtrSpan>
                {'primary' in d && d.primary && (
                  <span className="ml-2 rounded-full bg-cyan-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Primary
                  </span>
                )}
                {'alias' in d && d.alias && (
                  <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    Alias
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-600">{t(d.key)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
