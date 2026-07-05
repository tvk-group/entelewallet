'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n-context';
import { ROUTES, DOMAIN_CONFIG, PUBLIC_CONTACT_EMAILS } from '@entelewallet/config';
import { Alert, LtrSpan } from '@entelewallet/ui';
import { Shield } from 'lucide-react';

export function Footer() {
  const t = useT();

  const sections = [
    {
      title: t('footer.appSection'),
      links: [
        { href: ROUTES.overview, label: t('nav.overview') },
        { href: ROUTES.connect, label: t('footer.connectWallet') },
        { href: ROUTES.assets, label: t('nav.assets') },
        { href: ROUTES.vesting, label: t('nav.vesting') },
        { href: ROUTES.claims, label: t('nav.claims') },
        { href: ROUTES.install, label: t('nav.install') },
      ],
    },
    {
      title: t('footer.trustSection'),
      links: [
        { href: ROUTES.security, label: t('nav.security') },
        { href: ROUTES.transparency, label: t('nav.transparency') },
        { href: ROUTES.officialDomains, label: t('nav.officialDomains') },
        { href: ROUTES.risk, label: t('footer.riskDisclosure') },
        { href: ROUTES.legal, label: t('nav.legal') },
        { href: ROUTES.privacy, label: t('footer.privacy') },
        { href: ROUTES.terms, label: t('footer.terms') },
      ],
    },
    {
      title: t('footer.supportSection'),
      links: [
        { href: ROUTES.support, label: t('nav.support') },
        { href: `${ROUTES.support}?type=phishing`, label: t('footer.reportPhishing') },
        { href: `${ROUTES.support}?type=domain`, label: t('footer.reportFakeDomain') },
      ],
    },
    {
      title: t('footer.ecosystemSection'),
      links: [
        { href: DOMAIN_CONFIG.entelekron, label: 'EnteleKRON', external: true },
        { href: ROUTES.ecosystem, label: t('nav.ecosystem') },
        { href: 'https://tvk.group', label: 'TVK Group', external: true },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/40 bg-gradient-to-b from-slate-50/80 via-white/90 to-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/60 via-white/80 to-violet-50/60 p-4 shadow-sm backdrop-blur-sm">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
          <Alert variant="info" className="border-0 bg-transparent p-0 text-xs shadow-none">
            {t('footer.notice')}
          </Alert>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 transition hover:text-cyan-700"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 transition hover:text-cyan-700"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/60 bg-white/50 p-6 backdrop-blur-sm">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            {t('footer.contactSection')}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {PUBLIC_CONTACT_EMAILS.map(({ email }) => (
              <li key={email}>
                <a
                  href={`mailto:${email}`}
                  className="text-sm font-medium text-cyan-800 transition hover:text-violet-800"
                >
                  <LtrSpan>{email}</LtrSpan>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-900 to-violet-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-600">{t('brand.lite')}</p>
          </div>
          <p className="text-sm text-slate-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
