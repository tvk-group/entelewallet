'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Shield,
  Wallet,
  Eye,
  FileCheck,
  Clock,
  Smartphone,
  Monitor,
  Apple,
  Ban,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { getPublicOfficialAddresses } from '@entelewallet/config';
import { Button, LtrSpan } from '@entelewallet/ui';
import { cn } from '@entelewallet/utils';
import { EcosystemHyperfield } from '@/components/ecosystem-hyperfield';

function PremiumCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        'premium-card group relative animate-slide-up overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg backdrop-blur-xl transition hover:border-cyan-200/60 hover:shadow-xl hover:shadow-cyan-500/10',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-violet-500/0 opacity-0 transition group-hover:opacity-100 group-hover:from-cyan-500/5 group-hover:to-violet-500/5" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function HomeSafetyBar() {
  const t = useT();
  return (
    <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-white/80 to-cyan-50/60 px-6 py-4 text-center text-sm font-medium text-slate-800 shadow-sm backdrop-blur-sm">
      {t('footer.notice')}
    </div>
  );
}

export function HomeWhatItDoes() {
  const t = useT();
  const doesKeys = [
    'home.doesConnect',
    'home.doesVerify',
    'home.doesMonitor',
    'home.doesAddresses',
    'home.doesVesting',
    'home.doesPwa',
  ] as const;
  const icons = [Wallet, Shield, Eye, FileCheck, Clock, Smartphone];

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.whatItDoesTitle')}</h2>
        <p className="mt-2 text-slate-600">{t('home.whatItDoesSubtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doesKeys.map((key, i) => {
          const Icon = icons[i];
          return (
            <PremiumCard key={key} delay={i * 50} className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 via-cyan-600 to-violet-600 shadow-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">{t(key)}</h3>
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}

export function HomeWhatItDoesNot() {
  const t = useT();
  const notKeys = [
    'home.notSeed',
    'home.notKeys',
    'home.notCustody',
    'home.notSwaps',
    'home.notStaking',
    'home.notFakeClaims',
  ] as const;

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.whatItDoesNotTitle')}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notKeys.map((key, i) => (
          <PremiumCard key={key} delay={i * 40} className="relative flex items-center gap-3 !p-4">
            <Ban className="h-5 w-5 shrink-0 text-amber-600" />
            <span className="text-sm font-medium text-slate-800">{t(key)}</span>
          </PremiumCard>
        ))}
      </div>
    </section>
  );
}

const ECOSYSTEM_NODES = [
  'EnteleKRON',
  'ENK',
  'SOVRA',
  'EnergieMIND',
  'EnteleSCAN',
  'EnteleVAULT',
  'TVK ID',
  'TVK Group',
];

export function HomeEcosystemMap() {
  const t = useT();

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-blue-50/80 via-white/60 to-violet-50/80 p-8 shadow-xl backdrop-blur-sm sm:p-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
          <defs>
            <pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" className="text-blue-900" />
        </svg>
      </div>
      <div className="relative z-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.ecosystemTitle')}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">{t('home.ecosystemSubtitle')}</p>
        <EcosystemHyperfield nodes={ECOSYSTEM_NODES} />
      </div>
    </section>
  );
}

const TIMELINE_KEYS = [
  'home.timelineDomain',
  'home.timelineConnect',
  'home.timelineSafety',
  'home.timelineSign',
  'home.timelineVerify',
  'home.timelineMonitor',
] as const;

export function HomeSecurityTimeline() {
  const t = useT();

  return (
    <section className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.securityTimelineTitle')}</h2>
      </div>
      <ol className="relative mx-auto max-w-3xl space-y-0">
        {TIMELINE_KEYS.map((key, i) => (
          <li key={key} className="timeline-step relative flex gap-4 pb-8 last:pb-0">
            {i < TIMELINE_KEYS.length - 1 && (
              <span className="absolute left-[1.125rem] top-10 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-cyan-400/60 to-violet-400/30" />
            )}
            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-violet-600 text-sm font-bold text-white shadow-md">
              {i + 1}
            </div>
            <div className="pt-1">
              <p className="font-semibold text-slate-900">{t(key)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HomeEnkPreview() {
  const t = useT();
  const enk = getPublicOfficialAddresses().find((a) => a.id === 'enk_contract');
  const [copied, setCopied] = useState(false);

  if (!enk?.address) return null;

  async function copyAddress() {
    if (!enk?.address) return;
    await navigator.clipboard.writeText(enk.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.transparencyPreviewTitle')}</h2>
      </div>
      <PremiumCard className="relative mx-auto max-w-2xl !p-8 verified-glow border-emerald-200/60">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{enk.name}</h3>
              <p className="text-sm text-slate-500">{enk.network} · {t('transparency.verified')}</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {t('transparency.verified')}
          </span>
        </div>
        <LtrSpan className="block break-all rounded-xl bg-slate-50/80 px-4 py-3 font-mono text-sm text-slate-800">
          {enk.address}
        </LtrSpan>
        <p className="mt-3 text-sm text-slate-600">
          {t('transparency.decimals')}: 18 · {t('transparency.maxSupply')}: 100,000,000,000 ENK
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={copyAddress} className="gap-2">
            <Copy className="h-4 w-4" />
            {copied ? t('common.copied') : t('common.copyAddress')}
          </Button>
          {enk.explorerUrl && (
            <a href={enk.explorerUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {t('common.viewExplorer')}
              </Button>
            </a>
          )}
          <Link href={ROUTES.transparency}>
            <Button variant="ghost" size="sm">{t('common.transparencyCenter')}</Button>
          </Link>
        </div>
      </PremiumCard>
    </section>
  );
}

export function HomePwaSection() {
  const t = useT();
  const steps = [
    { icon: Apple, title: t('install.iphoneTitle'), body: t('install.iphoneSteps') },
    { icon: Smartphone, title: t('install.androidTitle'), body: t('install.androidSteps') },
    { icon: Monitor, title: t('install.desktopTitle'), body: t('install.desktopSteps') },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Sparkles className="h-8 w-8 text-violet-600" />
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('home.pwaSectionTitle')}</h2>
        <p className="max-w-xl text-slate-600">{t('install.description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <PremiumCard key={title} delay={i * 60} className="relative">
            <Icon className="mb-3 h-8 w-8 text-cyan-700" />
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </PremiumCard>
        ))}
      </div>
      <div className="text-center">
        <Link href={ROUTES.install}>
          <Button size="lg" className="btn-primary-glow rounded-xl">
            {t('common.installApp')}
          </Button>
        </Link>
      </div>
    </section>
  );
}
