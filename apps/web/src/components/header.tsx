'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n-context';
import { NAV_ROUTES, ROUTES } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { WalletConnectButton } from './wallet-connect-button';
import { LanguageSelector } from './language-selector';

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-gradient">{t('brand.name')}</span>
            <span className="ml-1.5 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-800">
              Lite
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                pathname === route.href
                  ? 'bg-cyan-50 text-cyan-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {t(route.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector className="hidden sm:inline-flex" />
          <Link href={ROUTES.connect}>
            <WalletConnectButton size="sm" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('common.menu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 xl:hidden animate-fade-in">
          <div className="mb-3 sm:hidden">
            <LanguageSelector className="w-full justify-center" />
          </div>
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-2.5 text-sm font-medium',
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
