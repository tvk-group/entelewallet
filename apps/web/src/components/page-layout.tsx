'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { usePwa } from '@/lib/pwa-context';
import { cn } from '@entelewallet/utils';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideTitle?: boolean;
  fullWidth?: boolean;
  /** Hide marketing footer on mobile app shell */
  appShell?: boolean;
}

export function PageLayout({
  children,
  title,
  description,
  hideTitle,
  fullWidth,
  appShell = true,
}: PageLayoutProps) {
  const { isAppMode } = usePwa();
  const useMobileShell = appShell && isAppMode;

  return (
    <div className={cn('app-futuristic-bg flex min-h-screen flex-col', useMobileShell && 'mobile-app-shell')}>
      <Header />
      <main className="relative z-10 flex-1">
        <div
          className={cn(
            fullWidth
              ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10'
              : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12',
            useMobileShell && 'pb-24 pt-4',
          )}
        >
          {!hideTitle && title && (
            <div className={cn('mb-10', useMobileShell && 'mb-6')}>
              <h1
                className={cn(
                  'font-bold tracking-tight text-slate-900',
                  useMobileShell ? 'text-2xl' : 'text-3xl sm:text-4xl',
                )}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={cn(
                    'mt-3 max-w-3xl leading-relaxed text-slate-600',
                    useMobileShell ? 'text-base' : 'text-lg',
                  )}
                >
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
      {!useMobileShell && <Footer />}
      {useMobileShell && <MobileBottomNav />}
    </div>
  );
}
