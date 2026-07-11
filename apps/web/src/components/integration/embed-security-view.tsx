'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n-context';
import { ROUTES, OFFICIAL_DOMAINS } from '@entelewallet/config';
import { SEED_PHRASE_WARNING, MALICIOUS_SIGNATURE_WARNING } from '@entelewallet/security';
import { Shield, AlertTriangle } from 'lucide-react';

export function EmbedSecurityView() {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-accent">
        <Shield className="h-5 w-5" />
        <h2 className="text-sm font-bold text-white">{t('integration.embedSecurityTitle')}</h2>
      </div>

      <div className="space-y-3 text-xs leading-relaxed text-white/75">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="font-semibold">{t('security.seedPhraseWarning')}</span>
          </div>
          <p>{SEED_PHRASE_WARNING}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-1 font-semibold text-white">{t('security.signatureSafety')}</p>
          <p className="text-white/65">{MALICIOUS_SIGNATURE_WARNING}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 font-semibold text-white">{t('security.officialDomains')}</p>
          <ul className="space-y-1 font-mono text-[11px] text-accent">
            {OFFICIAL_DOMAINS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={ROUTES.security}
        className="block text-center text-xs font-medium text-accent hover:text-accent/80"
      >
        {t('common.viewSecurityCenter')} →
      </Link>
    </div>
  );
}
