'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n-context';
import { NAV_ROUTES, ROUTES } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WalletConnectButton } from './wallet-connect-button';
import { LanguageSelector } from './language-selector';
import { BrandLogo } from './brand-logo';

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/60 shadow-sm shadow-blue-900/5 backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="group flex shrink-0 items-center">
          <BrandLogo variant="lockup-dark" priority />
          <span className="sr-only">{t('brand.name')}</span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition-all',
                pathname === route.href
                  ? 'bg-gradient-to-r from-cyan-50/90 to-violet-50/90 text-blue-900 shadow-sm ring-1 ring-cyan-200/50'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900',
              )}
            >
              {t(route.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSelector className="hidden sm:inline-flex" />
          <WalletConnectButton className="btn-primary-glow !rounded-xl" />
          <button
            type="button"
            className="rounded-xl border border-white/60 bg-white/70 p-2.5 text-slate-600 shadow-sm backdrop-blur hover:bg-white xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('common.menu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/40 bg-white/90 px-4 py-4 backdrop-blur-2xl xl:hidden animate-fade-in">
          <div className="mb-3 sm:hidden">
            <LanguageSelector className="w-full justify-center" />
          </div>
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-xl px-3 py-2.5 text-sm font-medium',
                pathname === route.href ? 'bg-cyan-50 text-cyan-900' : 'text-slate-600',
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
