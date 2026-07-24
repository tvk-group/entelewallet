'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Button } from '@entelewallet/ui';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { WalletAppPreview } from './wallet-app-preview';
import { BrandLogo } from '@/components/brand-logo';
import { usePwa } from '@/lib/pwa-context';

const TRUST_CHIP_KEYS = [
  'home.trustChipNoSeed',
  'home.trustChipNoKeys',
  'home.trustChipNoCustody',
  'home.trustChipSafeSig',
  'home.trustChipEnkVerified',
] as const;

export function HomeHero() {
  const t = useT();
  const { showInstallPrompts, isAppMode } = usePwa();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/30 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-sm sm:p-10 lg:p-12">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[2rem]">
        <div className="hero-glow-drift absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="hero-glow-drift absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl [animation-delay:-6s]" />
      </div>

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-slate-950 p-4 shadow-lg ring-1 ring-slate-800/60 sm:p-5">
            <BrandLogo variant="banner-dark" priority />
          </div>

          <div className="chip-fade-in inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-gradient-to-r from-cyan-50/90 to-violet-50/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-900 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {t('home.heroBadge')}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              {t('brand.lite')}
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              <span className="text-gradient">{t('home.heroGateway')}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              {t('home.heroSubtitleLong')}
            </p>
            <p className="text-sm font-medium text-slate-500">{t('home.productIdentity')}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <WalletConnectButton className="btn-primary-glow" />
            <Link href={ROUTES.signIn}>
              <Button variant="primary" size="lg" className="rounded-xl">
                {t('common.signIn')}
              </Button>
            </Link>
            <Link href={`${ROUTES.signIn}?mode=signup`}>
              <Button variant="secondary" size="lg" className="glass-btn rounded-xl">
                {t('common.createAccount')}
              </Button>
            </Link>
            <Link href={ROUTES.security}>
              <Button variant="secondary" size="lg" className="glass-btn rounded-xl">
                {t('common.securityCenter')}
              </Button>
            </Link>
            <Link href={ROUTES.transparency}>
              <Button variant="outline" size="lg" className="glass-btn rounded-xl">
                {t('common.transparencyCenter')}
              </Button>
            </Link>
            {showInstallPrompts && !isAppMode && (
              <Link href={ROUTES.install}>
                <Button variant="ghost" size="lg" className="gap-2 rounded-xl">
                  <Download className="h-4 w-4" />
                  {t('common.installApp')}
                </Button>
              </Link>
            )}
            {isAppMode && (
              <Link href={ROUTES.overview}>
                <Button variant="primary" size="lg" className="rounded-xl">
                  {t('common.openApp')}
                </Button>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {TRUST_CHIP_KEYS.map((key, i) => (
              <span
                key={key}
                className="chip-fade-in rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        <WalletAppPreview />
      </div>
    </section>
  );
}
