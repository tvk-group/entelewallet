'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent, Badge } from '@entelewallet/ui';

const ECOSYSTEM = [
  { name: 'EnteleKRON', status: 'live' },
  { name: 'ENK', status: 'live' },
  { name: 'EnteleWALLET Lite', status: 'live' },
  { name: 'SOVRA', status: 'development' },
  { name: 'EnergieMIND / ENM', status: 'development' },
  { name: 'EnteleSCAN', status: 'planned' },
  { name: 'EnteleVAULT', status: 'planned' },
  { name: 'EnteleCLOS', status: 'future' },
  { name: 'EnteleLEDGER', status: 'future' },
  { name: 'EnteleLINK', status: 'future' },
  { name: 'TVK ID', status: 'planned' },
  { name: 'GraphVault', status: 'future' },
  { name: 'ChronoSeal', status: 'future' },
  { name: 'Q-Presence', status: 'future' },
  { name: 'Sentient Signals', status: 'future' },
  { name: 'TVK Group', status: 'live' },
  { name: 'TVK Labs', status: 'live' },
] as const;

export default function EcosystemPage() {
  const t = useT();

  const statusLabel = (s: string) => {
    if (s === 'live') return t('ecosystem.statusLive');
    if (s === 'development') return t('ecosystem.statusDevelopment');
    if (s === 'planned') return t('ecosystem.statusPlanned');
    return t('ecosystem.statusFuture');
  };

  const statusVariant = (s: string) => {
    if (s === 'live') return 'success' as const;
    if (s === 'development') return 'info' as const;
    if (s === 'planned') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <PageLayout title={t('ecosystem.title')} description={t('ecosystem.description')}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ECOSYSTEM.map((item, i) => (
          <Card key={item.name} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
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
