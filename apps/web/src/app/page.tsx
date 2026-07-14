'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { BrandLogo } from '@/components/brand-logo';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { useT } from '@/lib/i18n-context';
import { ROUTES, websiteUrl } from '@entelewallet/config';
import { Alert, Button } from '@entelewallet/ui';

export default function HomePage() {
  const t = useT();

  return (
    <PageLayout hideTitle fullWidth>
      <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center sm:py-16">
        <div className="mb-8 overflow-hidden rounded-2xl bg-slate-950 p-5 shadow-lg ring-1 ring-slate-800/60">
          <BrandLogo variant="banner-dark" priority />
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          {t('brand.lite')}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t('auth.landingTitle')}
        </h1>
        <p className="mt-3 max-w-md text-lg leading-relaxed text-slate-600">
          {t('auth.landingSubtitle')}
        </p>

        <Alert variant="info" className="mt-6 w-full text-left text-sm">
          {t('warnings.liteNotice')}
        </Alert>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={ROUTES.signIn} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="btn-primary-glow w-full rounded-xl">
              {t('common.signIn')}
            </Button>
          </Link>
          <Link href={`${ROUTES.signIn}?mode=signup`} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="glass-btn w-full rounded-xl">
              {t('common.createAccount')}
            </Button>
          </Link>
        </div>

        <div className="mt-4 w-full sm:w-auto">
          <WalletConnectButton className="btn-primary-glow w-full !rounded-xl" />
        </div>

        <p className="mt-10 text-sm text-slate-500">
          <a
            href={websiteUrl('home')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-cyan-700 transition hover:text-cyan-900"
          >
            {t('auth.visitWebsite')}
            <ExternalLink className="h-4 w-4" />
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
