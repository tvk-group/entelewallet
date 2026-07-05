'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { SecurityBanner } from '@/components/security-banner';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button } from '@entelewallet/ui';
import {
  Shield,
  Wallet,
  BarChart3,
  FileCheck,
  Lock,
  Sparkles,
  Download,
} from 'lucide-react';

const featureIcons = [Shield, BarChart3, FileCheck, Lock, Sparkles, Download];

export default function HomePage() {
  const t = useT();

  const features = [
    t('home.featureWalletVerification'),
    t('home.featureAssetMonitoring'),
    t('home.featureVestingClaims'),
    t('home.featureAddressVerification'),
    t('home.featureSecurityFirst'),
    t('home.featureRoadmap'),
  ];

  const orbitItems = ['EnteleKRON', 'ENK', 'SOVRA', 'EnergieMIND', 'EnteleSCAN', 'EnteleVAULT', 'TVK ID'];

  return (
    <PageLayout title={t('home.heroTitle')} description={t('home.heroHeadline')}>
      <div className="space-y-16">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-8 sm:p-12 animate-fade-in">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-700">
              {t('brand.lite')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('home.heroHeadline')}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{t('home.heroSubtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WalletConnectButton size="lg" />
              <Link href={ROUTES.security}>
                <Button variant="secondary" size="lg">
                  {t('common.securityCenter')}
                </Button>
              </Link>
              <Link href={ROUTES.transparency}>
                <Button variant="outline" size="lg">
                  {t('common.transparencyCenter')}
                </Button>
              </Link>
              <Link href={ROUTES.install}>
                <Button variant="ghost" size="lg" className="gap-2">
                  <Download className="h-4 w-4" />
                  {t('common.installApp')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="ecosystem-orbit pointer-events-none absolute -right-8 top-1/2 hidden h-64 w-64 -translate-y-1/2 lg:block" aria-hidden>
            <div className="orbit-core">ENK</div>
            {orbitItems.map((item, i) => (
              <span key={item} className="orbit-node" style={{ '--i': i } as React.CSSProperties}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <SecurityBanner />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <Card key={feature} className="animate-slide-up transition hover:shadow-lg" style={{ animationDelay: `${i * 60}ms` }}>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-violet-100">
                    <Icon className="h-5 w-5 text-cyan-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{feature}</h3>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card className="border-violet-200/60 bg-gradient-to-r from-violet-50/80 to-cyan-50/80">
          <CardContent className="flex items-start gap-4 p-6">
            <Wallet className="mt-1 h-6 w-6 shrink-0 text-violet-600" />
            <p className="text-sm leading-relaxed text-slate-700">{t('home.roadmapBlock')}</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
