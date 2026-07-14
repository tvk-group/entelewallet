'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LtrSpan } from '@entelewallet/ui';
import { useAccount, useChainId } from 'wagmi';
import { useNetworkView } from '@/lib/network-view-context';
import { getVerificationBadgeKey } from '@entelewallet/wallet-core';
import { ExternalLink } from 'lucide-react';
import { getExplorerAddressUrl } from '@entelewallet/blockchain';
import { truncateAddress } from '@entelewallet/utils';

export default function OverviewPage() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { verificationStatus, isVerified } = useWalletStatus();
  const { activeNetwork } = useNetworkView();

  if (!isConnected) {
    return (
      <PageLayout title={t('overview.title')} description={t('overview.description')}>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">{t('common.noWalletConnected')}</p>
            <Link href={ROUTES.connect} className="mt-4 inline-block">
              <Button>{t('common.goToConnect')}</Button>
            </Link>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const kpis = [
    { label: t('overview.verification'), value: t(getVerificationBadgeKey(verificationStatus)) },
    { label: t('overview.network'), value: activeNetwork?.name ?? `Chain ${chainId}` },
    { label: t('overview.vestingStatus'), value: t('overview.notLinked') },
    { label: t('overview.claimStatus'), value: t('claims.notOpen') },
  ];

  return (
    <PageLayout title={t('overview.title')} description={t('overview.description')}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('overview.address')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <LtrSpan className="text-lg font-mono">{truncateAddress(address!)}</LtrSpan>
            <Badge variant={isVerified ? 'success' : 'warning'}>
              {t(getVerificationBadgeKey(verificationStatus))}
            </Badge>
            <a
              href={getExplorerAddressUrl(chainId, address!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-cyan-700"
            >
              {t('common.viewExplorer')} <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="mt-1 font-semibold text-slate-900">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: ROUTES.assets, label: t('nav.assets') },
            { href: ROUTES.vesting, label: t('nav.vesting') },
            { href: ROUTES.claims, label: t('nav.claims') },
            { href: ROUTES.transactions, label: t('nav.transactions') },
            { href: ROUTES.transparency, label: t('nav.transparency') },
            { href: ROUTES.security, label: t('nav.security') },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4 font-medium text-cyan-800">{link.label}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
