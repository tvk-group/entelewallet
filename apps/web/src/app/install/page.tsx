'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button } from '@entelewallet/ui';
import { Smartphone, Monitor, Apple } from 'lucide-react';
import { PwaInstallMockup } from '@/components/pwa-install-mockup';

export default function InstallPage() {
  const t = useT();

  const steps = [
    { icon: Apple, title: t('install.iphoneTitle'), body: t('install.iphoneSteps') },
    { icon: Smartphone, title: t('install.androidTitle'), body: t('install.androidSteps') },
    { icon: Monitor, title: t('install.desktopTitle'), body: t('install.desktopSteps') },
  ];

  return (
    <PageLayout title={t('install.title')} description={t('install.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PwaInstallMockup />

        <div className="grid gap-4">
          {steps.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="animate-slide-up">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                  <Icon className="h-6 w-6 text-cyan-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-6 text-sm text-amber-900">{t('install.storeFuture')}</CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link href={ROUTES.connect}>
            <Button size="lg">{t('install.openWallet')}</Button>
          </Link>
          <Link href={ROUTES.security}>
            <Button variant="secondary" size="lg">
              {t('common.securityCenter')}
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
