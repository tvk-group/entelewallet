'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n-context';
import { ROUTES, CONTACT } from '@entelewallet/config';

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-500">{t('footer.copyright')}</p>
          <nav className="flex gap-6 text-sm">
            <Link href={ROUTES.security} className="text-slate-600 hover:text-cyan-700">
              {t('footer.security')}
            </Link>
            <Link href={ROUTES.legal} className="text-slate-600 hover:text-cyan-700">
              {t('footer.legal')}
            </Link>
            <Link href={ROUTES.support} className="text-slate-600 hover:text-cyan-700">
              {t('footer.support')}
            </Link>
          </nav>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          {CONTACT.security} · {CONTACT.support}
        </p>
      </div>
    </footer>
  );
}
