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
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={ROUTES.home} className="group flex shrink-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-cyan-600 to-violet-600 shadow-lg ring-2 ring-white/50 transition group-hover:scale-105">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="block text-base font-bold tracking-tight text-gradient">{t('brand.name')}</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              EnteleKRON · TVK
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-all',
                pathname === route.href
                  ? 'bg-gradient-to-r from-cyan-50 to-violet-50 text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
              )}
            >
              {t(route.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageSelector className="hidden sm:inline-flex" />
          <WalletConnectButton size="sm" />
          <button
            type="button"
            className="rounded-xl border border-slate-200/80 bg-white/80 p-2.5 text-slate-600 backdrop-blur hover:bg-white xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('common.menu')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100/80 bg-white/95 px-4 py-4 backdrop-blur-xl xl:hidden animate-fade-in">
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
