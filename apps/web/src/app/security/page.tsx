'use client';

import { PageLayout } from '@/components/page-layout';
import { SecurityBanner, SignatureWarningBanner } from '@/components/security-banner';
import { useT } from '@/lib/i18n-context';
import {
  OFFICIAL_DOMAINS,
  REDIRECT_DOMAINS,
  CONTACT,
  CANONICAL_APP_DOMAIN,
} from '@entelewallet/config';
import {
  SEED_PHRASE_WARNING,
  PHISHING_TIPS,
  SUPPORTED_WALLETS,
  MALICIOUS_SIGNATURE_WARNING,
} from '@entelewallet/security';
import { Card, CardContent, CardHeader, CardTitle, Alert, LtrSpan } from '@entelewallet/ui';

export default function SecurityPage() {
  const t = useT();

  const sections = [
    {
      title: t('security.officialDomains'),
      content: (
        <ul className="space-y-1">
          {OFFICIAL_DOMAINS.map((d) => (
            <li key={d}>
              <LtrSpan className="text-sm text-cyan-800">{d}</LtrSpan>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: t('security.redirectDomains'),
      content: (
        <ul className="space-y-1">
          {REDIRECT_DOMAINS.map((d) => (
            <li key={d}>
              <LtrSpan className="text-sm text-slate-600">{d}</LtrSpan>
              <span className="ml-2 text-xs text-slate-400">→ {CANONICAL_APP_DOMAIN}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: t('security.seedPhraseWarning'),
      content: <p className="text-sm text-slate-600">{SEED_PHRASE_WARNING}</p>,
    },
    {
      title: t('security.signatureSafety'),
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">{t('security.signatureSafetyDetail')}</p>
          <Alert variant="warning">{MALICIOUS_SIGNATURE_WARNING}</Alert>
        </div>
      ),
    },
    {
      title: t('security.walletConnectSafety'),
      content: <p className="text-sm text-slate-600">{t('security.walletConnectDetail')}</p>,
    },
    {
      title: t('security.supportedWallets'),
      content: (
        <ul className="grid gap-1 sm:grid-cols-2">
          {SUPPORTED_WALLETS.map((w) => (
            <li key={w} className="text-sm text-slate-600">
              • {w}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: t('security.phishingProtection'),
      content: (
        <ul className="space-y-2">
          {PHISHING_TIPS.map((tip) => (
            <li key={tip} className="text-sm text-slate-600">
              • {tip}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: t('security.reportConcern'),
      content: (
        <div className="space-y-3 text-sm text-slate-600">
          <p>{t('security.reportConcernIntro')}</p>
          <a
            href={`mailto:${CONTACT.security}`}
            className="inline-flex items-center font-medium text-cyan-800 hover:text-cyan-950"
          >
            <LtrSpan>{CONTACT.security}</LtrSpan>
          </a>
        </div>
      ),
    },
  ];

  return (
    <PageLayout title={t('security.title')} description={t('security.description')}>
      <div className="space-y-6">
        <SecurityBanner />
        <SignatureWarningBanner />

        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>{section.content}</CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
