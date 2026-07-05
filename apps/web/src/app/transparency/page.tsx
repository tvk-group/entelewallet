'use client';

import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { DOMAIN_CONFIG, TRANSPARENCY_ADDRESSES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Badge, LtrSpan } from '@entelewallet/ui';
import { ExternalLink } from 'lucide-react';

const labelKeys: Record<string, string> = {
  enk_contract: 'transparency.enkContract',
  treasury_safe: 'transparency.treasurySafe',
  presale_safe: 'transparency.presaleSafe',
  liquidity_safe: 'transparency.liquiditySafe',
  vesting_safe: 'transparency.vestingSafe',
  ecosystem_reserve_safe: 'transparency.ecosystemReserveSafe',
  governance_safe: 'transparency.governanceSafe',
};

export default function TransparencyPage() {
  const t = useT();

  return (
    <PageLayout title={t('transparency.title')} description={t('transparency.description')}>
      <div className="space-y-6">
        <a
          href={DOMAIN_CONFIG.transparency}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800 hover:bg-cyan-100"
        >
          {t('transparency.externalLink')} <ExternalLink className="h-4 w-4" />
        </a>

        <div className="grid gap-4 sm:grid-cols-2">
          {TRANSPARENCY_ADDRESSES.map((item) => (
            <Card key={item.key}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {t(labelKeys[item.key] || item.label)}
                </CardTitle>
                {item.pendingOfficialVerification && (
                  <Badge variant="warning">{t('common.pendingVerification')}</Badge>
                )}
              </CardHeader>
              <CardContent>
                {item.address ? (
                  <LtrSpan className="text-sm font-mono">{item.address}</LtrSpan>
                ) : (
                  <p className="text-sm text-slate-500">{t('common.pendingVerification')}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
