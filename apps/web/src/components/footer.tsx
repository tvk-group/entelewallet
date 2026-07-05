'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n-context';
import { ROUTES, DOMAIN_CONFIG, PUBLIC_CONTACT_EMAILS } from '@entelewallet/config';
import { Alert, LtrSpan } from '@entelewallet/ui';

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

  const footerEmails = PUBLIC_CONTACT_EMAILS.filter((e) =>
    ['contact', 'support', 'security', 'legal'].includes(e.key),
  );

  return (
    <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Alert variant="info" className="mb-8 text-xs">
          {t('footer.notice')}
        </Alert>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-semibold text-slate-900">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 hover:text-cyan-700"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-slate-600 hover:text-cyan-700">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('footer.contactSection')}
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {footerEmails.map(({ email }) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="text-sm text-cyan-800 hover:text-cyan-950">
                  <LtrSpan>{email}</LtrSpan>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
