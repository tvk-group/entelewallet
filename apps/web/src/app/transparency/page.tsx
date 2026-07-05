'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { getPublicOfficialAddresses } from '@entelewallet/config';
import { DOMAIN_CONFIG } from '@entelewallet/config';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  LtrSpan,
  Button,
  Alert,
} from '@entelewallet/ui';
import { ExternalLink, Copy, ShieldCheck } from 'lucide-react';
import type { OfficialAddressStatus } from '@entelewallet/config';

function statusBadge(status: OfficialAddressStatus, t: (k: string) => string) {
  if (status === 'verified') return { variant: 'success' as const, label: t('transparency.verified') };
  if (status === 'internal_only') return { variant: 'default' as const, label: t('transparency.internalOnly') };
  if (status === 'not_published') return { variant: 'default' as const, label: t('transparency.notPublished') };
  return { variant: 'warning' as const, label: t('transparency.pendingVerification') };
}

export default function TransparencyPage() {
  const t = useT();
  const addresses = getPublicOfficialAddresses();
  const [copied, setCopied] = useState<string | null>(null);

  async function copyAddress(id: string, address: string) {
    await navigator.clipboard.writeText(address);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <PageLayout title={t('transparency.title')} description={t('transparency.description')}>
      <div className="space-y-6">
        <Alert variant="warning" className="security-panel-glow animate-fade-in">
          {t('transparency.safetyNotice')}
        </Alert>
        <Alert variant="info">{t('transparency.paymentWarning')}</Alert>

        <a
          href={DOMAIN_CONFIG.transparency}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-violet-50 px-5 py-3 text-sm font-medium text-cyan-900 transition hover:shadow-md"
        >
          {t('transparency.externalLink')} <ExternalLink className="h-4 w-4" />
        </a>

        <div className="grid gap-4 lg:grid-cols-2">
          {addresses.map((item, i) => {
            const badge = statusBadge(item.status, t);
            return (
              <Card
                key={item.id}
                className={`transition-all hover:shadow-lg animate-slide-up ${item.status === 'verified' ? 'verified-glow border-emerald-200' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.status === 'verified' && (
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    )}
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-slate-500">
                    {t('common.category')}: {item.category} · {item.network}
                  </p>
                  {item.address ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <LtrSpan className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs">
                        {item.address}
                      </LtrSpan>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(item.id, item.address!)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied === item.id ? t('common.copied') : t('common.copyAddress')}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-500">{t('transparency.pendingVerification')}</p>
                  )}
                  {item.maxSupply && (
                    <p>
                      {t('transparency.maxSupply')}: <LtrSpan>{item.maxSupply} ENK</LtrSpan>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">{t('transparency.purpose')}:</span> {item.purpose}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium">{t('transparency.safetyNote')}:</span>{' '}
                    {item.safetyNote}
                  </p>
                  {item.explorerUrl && (
                    <a
                      href={item.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-900"
                    >
                      {t('common.viewExplorer')} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
