'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useT, useI18n } from '@/lib/i18n-context';
import { NAV_ROUTES, ROUTES } from '@entelewallet/config';
import { LANGUAGES } from '@entelewallet/i18n';
import { cn } from '@entelewallet/utils';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-cyan-600" />
          <span className="text-lg font-bold text-gradient">EnteleWALLET</span>
          <span className="hidden rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800 sm:inline">
            Lite
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ROUTES.slice(0, 6).map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === route.href
                  ? 'bg-cyan-50 text-cyan-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {t(route.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as typeof locale)}
            className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-xs sm:block"
            aria-label={t('common.language')}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="mb-3">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium',
                pathname === route.href ? 'bg-cyan-50 text-cyan-800' : 'text-slate-600',
              )}
            >
              {t(route.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
