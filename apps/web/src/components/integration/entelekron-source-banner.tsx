'use client';

import { ArrowLeft, ExternalLink } from 'lucide-react';
import { DOMAIN_CONFIG } from '@entelewallet/config';
import { useT } from '@/lib/i18n-context';

export function EntelekronSourceBanner() {
  const t = useT();
  const returnUrl = DOMAIN_CONFIG.entelekronInvestorDashboard;

  return (
    <div className="embed-source-banner flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-void/95 px-4 py-3 text-sm shadow-lg shadow-black/20">
      <p className="font-medium text-white/90">{t('integration.openedFromEntelekron')}</p>
      <a
        href={returnUrl}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/25"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {t('integration.backToEntelekron')}
        <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
      </a>
    </div>
  );
}
