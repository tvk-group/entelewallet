'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { ROUTES, getTokenBySymbol } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Button, LtrSpan } from '@entelewallet/ui';
import { useAccount, useChainId } from 'wagmi';
import { getExplorerAddressUrl, getExplorerTokenUrl } from '@entelewallet/blockchain';
import { ExternalLink } from 'lucide-react';

export default function TransactionsPage() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const enkToken = getTokenBySymbol('ENK');

  return (
    <PageLayout title={t('transactions.title')} description={t('transactions.description')}>
      <div className="space-y-6">
        <Card className="border-cyan-200 bg-cyan-50/50">
          <CardContent className="p-6">
            <p className="text-sm text-slate-700">{t('transactions.indexingFuture')}</p>
          </CardContent>
        </Card>

        {isConnected && address && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('transactions.walletExplorer')}</CardTitle>
              </CardHeader>
              <CardContent>
                <LtrSpan className="mb-3 block text-sm text-slate-500">{address}</LtrSpan>
                <a
                  href={getExplorerAddressUrl(chainId, address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-cyan-700"
                >
                  {t('common.viewExplorer')} <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {enkToken && !enkToken.pendingOfficialConfiguration && enkToken.contractAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('transactions.tokenExplorer')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={getExplorerTokenUrl(chainId, enkToken)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-cyan-700"
                  >
                    ENK {t('common.viewExplorer')} <ExternalLink className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!isConnected && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">{t('common.noWalletConnected')}</p>
              <Link href={ROUTES.connect} className="mt-4 inline-block">
                <Button>{t('common.goToConnect')}</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-8 text-center text-slate-400">
            {t('transactions.emptyState')}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
