'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { PageLayout } from '@/components/page-layout';
import { WalletPortfolioHeader } from '@/components/wallet-portfolio-header';
import { NetworkChainPicker } from '@/components/network-chain-picker';
import { PortfolioSection } from '@/components/portfolio/portfolio-section';
import { PortfolioHoldingsTable } from '@/components/portfolio/portfolio-holdings-table';
import { PortfolioDiscoveredSection } from '@/components/portfolio/portfolio-discovered-section';
import { PortfolioMarketSection } from '@/components/portfolio/portfolio-market-section';
import { PortfolioWatchlistSection } from '@/components/portfolio/portfolio-watchlist-section';
import { PortfolioEcosystemSection } from '@/components/portfolio/portfolio-ecosystem-section';
import { PortfolioSyncHandler } from '@/components/portfolio/portfolio-sync-handler';
import { PortfolioDisplayModeSelect } from '@/components/portfolio/portfolio-display-mode';
import { useEntelekronPortfolio } from '@/hooks/use-entelekron-portfolio';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { Loader2, RefreshCw } from 'lucide-react';

function AssetsPortfolioContent() {
  const t = useT();
  const { isConnected, status } = useAccount();
  const {
    preferences,
    updatePreferences,
    holdingsWithBalance,
    marketWithoutHoldings,
    discovered,
    ecosystem,
    totalUsd,
    isLoading,
    isRefreshing,
    hasError,
    syncPortfolio,
    formatBalance,
  } = useEntelekronPortfolio();

  const showMarketFirst = preferences.displayMode === 'all-market';
  const isEmpty = holdingsWithBalance.length === 0 && !isLoading;

  if (status === 'reconnecting') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-500">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-slate-500">{t('common.connectToView')}</p>
          <Link href={ROUTES.connect} className="mt-4 inline-block">
            <Button>{t('common.goToConnect')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Suspense fallback={null}>
        <PortfolioSyncHandler />
      </Suspense>

      <WalletPortfolioHeader
        totalUsd={totalUsd.totalUsd}
        isPartialTotal={totalUsd.isPartialTotal}
        displayMode={preferences.displayMode}
        onDisplayModeChange={(mode) => updatePreferences({ displayMode: mode })}
        isRefreshing={isRefreshing}
        isEmpty={isEmpty}
      />

      <PortfolioSection
        title={t('networks.title')}
        description={t('networks.switchHint')}
      >
        <div className="p-4">
          <NetworkChainPicker />
        </div>
      </PortfolioSection>

      {hasError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {t('assets.balanceFetchWarning')}
        </div>
      )}

      {showMarketFirst ? (
        <PortfolioSection
          title={t('portfolio.marketTitle')}
          description={t('portfolio.marketDescription')}
          action={
            <div className="flex items-center gap-2">
              <PortfolioDisplayModeSelect
                value={preferences.displayMode}
                onChange={(mode) => updatePreferences({ displayMode: mode })}
              />
              <button
                type="button"
                onClick={() => void syncPortfolio()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-cyan-200 disabled:opacity-60"
              >
                {isRefreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {t('assets.refresh')}
              </button>
            </div>
          }
        >
          <PortfolioMarketSection assets={marketWithoutHoldings} formatBalance={formatBalance} />
        </PortfolioSection>
      ) : (
        <>
          <PortfolioSection
            title={t('portfolio.holdingsTitle')}
            description={t('portfolio.holdingsDescription')}
            action={
              <button
                type="button"
                onClick={() => void syncPortfolio()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-cyan-200 disabled:opacity-60"
              >
                {isRefreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {t('assets.refresh')}
              </button>
            }
          >
            <PortfolioHoldingsTable
              holdings={holdingsWithBalance}
              formatBalance={formatBalance}
              loading={isLoading}
            />
          </PortfolioSection>

          <PortfolioSection
            title={t('portfolio.marketTitle')}
            description={t('portfolio.marketDescription')}
            action={
              <PortfolioDisplayModeSelect
                value={preferences.displayMode}
                onChange={(mode) => updatePreferences({ displayMode: mode })}
              />
            }
          >
            <PortfolioMarketSection assets={marketWithoutHoldings} formatBalance={formatBalance} />
          </PortfolioSection>
        </>
      )}

      <PortfolioSection
        title={t('portfolio.discoveredTitle')}
        description={t('portfolio.discoveredDescription')}
      >
        <PortfolioDiscoveredSection
          discovered={discovered}
          enabled={preferences.autoDiscoverEnabled}
          formatBalance={formatBalance}
        />
      </PortfolioSection>

      <PortfolioSection
        title={t('portfolio.watchlistTitle')}
        description={t('portfolio.watchlistDescription')}
      >
        <PortfolioWatchlistSection />
      </PortfolioSection>

      <PortfolioSection
        title={t('portfolio.ecosystemTitle')}
        description={t('portfolio.ecosystemDescription')}
      >
        <PortfolioEcosystemSection assets={ecosystem} />
      </PortfolioSection>
    </div>
  );
}

export default function AssetsPage() {
  const t = useT();

  return (
    <PageLayout title={t('assets.title')} description={t('assets.description')}>
      <AssetsPortfolioContent />
    </PageLayout>
  );
}
