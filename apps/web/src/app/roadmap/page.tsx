'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@entelewallet/ui';

export default function RoadmapPage() {
  const t = useT();

  const phases = [
    {
      title: t('roadmap.activeNow'),
      variant: 'success' as const,
      items: [
        t('roadmap.activeWalletConnect'),
        t('roadmap.activeVerification'),
        t('roadmap.activeAssets'),
        t('roadmap.activeTransparency'),
        t('roadmap.activeSecurity'),
      ],
    },
    {
      title: t('roadmap.nextPhase'),
      variant: 'info' as const,
      items: [
        t('roadmap.nextInvestorLinking'),
        t('roadmap.nextVesting'),
        t('roadmap.nextClaims'),
        t('roadmap.nextTransactions'),
      ],
    },
    {
      title: t('roadmap.futurePhase'),
      variant: 'warning' as const,
      items: [
        t('roadmap.futureCreateImport'),
        t('roadmap.futureKeyStorage'),
        t('roadmap.futureMobile'),
        t('roadmap.futureExtension'),
        t('roadmap.futureWalletConnectMode'),
        t('roadmap.futureSmartAccounts'),
        t('roadmap.futureRecovery'),
        t('roadmap.futureSimulation'),
        t('roadmap.futureAudits'),
        t('roadmap.futureBugBounty'),
      ],
      notice: t('roadmap.futureNotice'),
    },
  ];

  return (
    <PageLayout title={t('roadmap.title')} description={t('roadmap.description')}>
      <div className="space-y-6">
        {phases.map((phase) => (
          <Card key={phase.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <CardTitle>{phase.title}</CardTitle>
              <Badge variant={phase.variant}>{phase.items.length} items</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
              {'notice' in phase && phase.notice && (
                <p className="mt-4 text-sm font-medium text-amber-700">{phase.notice}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
