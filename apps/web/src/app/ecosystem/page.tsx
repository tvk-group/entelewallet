'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { ECOSYSTEM_PROJECTS, type EcosystemProjectStatus } from '@entelewallet/config';
import { Card, CardContent, Badge } from '@entelewallet/ui';
import { EcosystemCyberCoin } from '@/components/ecosystem-cyber-coin';

export default function EcosystemPage() {
  const t = useT();

  const statusLabel = (s: EcosystemProjectStatus) => {
    if (s === 'live') return t('ecosystem.statusLive');
    if (s === 'development') return t('ecosystem.statusDevelopment');
    if (s === 'planned') return t('ecosystem.statusPlanned');
    if (s === 'experimental') return t('ecosystem.statusFuture');
    if (s === 'concept') return t('ecosystem.statusFuture');
    return t('ecosystem.statusFuture');
  };

  const statusVariant = (s: EcosystemProjectStatus) => {
    if (s === 'live') return 'success' as const;
    if (s === 'development') return 'info' as const;
    if (s === 'planned') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <PageLayout title={t('ecosystem.title')} description={t('ecosystem.description')}>
      <div className="mb-10">
        <EcosystemCyberCoin />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ECOSYSTEM_PROJECTS.map((item, i) => (
          <Card
            key={item.id}
            className="animate-slide-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium text-slate-900">{item.name}</span>
              <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
