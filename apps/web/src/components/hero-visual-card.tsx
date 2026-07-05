'use client';

import { Shield, ShieldCheck, Wallet } from 'lucide-react';
import { useT } from '@/lib/i18n-context';
import { useAccount } from 'wagmi';
import { EcosystemOrbit } from './ecosystem-orbit';

const ORBIT_ITEMS = [
  'EnteleKRON',
  'ENK',
  'SOVRA',
  'EnergieMIND',
  'EnteleSCAN',
  'EnteleVAULT',
  'TVK ID',
];

export function HeroVisualCard() {
  const t = useT();
  const { isConnected } = useAccount();

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="animated-orb absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-200/40 to-violet-200/30 blur-2xl" />
        <div className="animated-orb absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-gradient-to-tr from-blue-200/30 to-cyan-100/20 blur-2xl" />
      </div>

      <div className="relative z-10 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="wallet-animation flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 via-cyan-600 to-violet-600 shadow-lg">
              {isConnected ? (
                <ShieldCheck className="h-6 w-6 text-white" />
              ) : (
                <Wallet className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                {t('brand.lite')}
              </p>
              <p className="text-sm font-medium text-slate-800">
                {isConnected ? t('common.walletConnected') : t('common.securityCenter')}
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0 text-cyan-600" />
              {t('home.featureWalletVerification')}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              {t('home.featureSecurityFirst')}
            </li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none lg:w-auto">
          <EcosystemOrbit items={ORBIT_ITEMS} compact />
        </div>
      </div>
    </div>
  );
}
