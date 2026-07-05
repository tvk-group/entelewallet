'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { SecurityBanner } from '@/components/security-banner';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@entelewallet/ui';
import {
  Shield,
  Wallet,
  BarChart3,
  Clock,
  FileCheck,
  Lock,
  Map,
} from 'lucide-react';

const featureIcons = [Shield, BarChart3, Clock, FileCheck, Lock, Map];

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

  return (
    <PageLayout title={t('home.heroTitle')} description={t('home.heroHeadline')}>
      <div className="space-y-12">
        <section className="text-center">
          <p className="mx-auto max-w-2xl text-lg text-slate-600">{t('home.heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href={ROUTES.connect}>
              <WalletConnectButton />
            </Link>
            <Link href={ROUTES.security}>
              <Button variant="secondary" size="lg">
                {t('common.viewSecurityCenter')}
              </Button>
            </Link>
            <Link href={ROUTES.transparency}>
              <Button variant="outline" size="lg">
                {t('common.openTransparencyCenter')}
              </Button>
            </Link>
          </div>
        </section>

        <SecurityBanner />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <Card key={feature}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
                    <Icon className="h-5 w-5 text-cyan-600" />
                  </div>
                  <CardTitle className="text-base">{feature}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </section>

        <Card className="border-violet-200 bg-gradient-to-r from-violet-50/50 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Wallet className="mt-1 h-5 w-5 text-violet-600" />
              <p className="text-sm text-slate-700">{t('home.roadmapBlock')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
