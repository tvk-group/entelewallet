'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@entelewallet/config';
import { useT } from '@/lib/i18n-context';
import { cn } from '@entelewallet/utils';
import { LayoutDashboard, Coins, Shield, Settings, Wallet } from 'lucide-react';

const TABS = [
  { href: ROUTES.overview, key: 'nav.overview', icon: LayoutDashboard },
  { href: ROUTES.assets, key: 'nav.assets', icon: Coins },
  { href: ROUTES.connect, key: 'nav.connect', icon: Wallet },
  { href: ROUTES.security, key: 'nav.security', icon: Shield },
  { href: ROUTES.settings, key: 'nav.settings', icon: Settings },
] as const;

export function MobileBottomNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/40 bg-white/85 backdrop-blur-2xl md:hidden"
      aria-label={t('nav.home')}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1">
        {TABS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href || (href !== ROUTES.overview && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[10px] font-medium transition',
                active
                  ? 'text-cyan-800'
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-800',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-cyan-600')} strokeWidth={active ? 2.25 : 2} />
              <span className="truncate">{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
