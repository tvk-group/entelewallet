'use client';

import { useT } from '@/lib/i18n-context';
import type { PortfolioAsset } from '@entelewallet/types';
import { AlertTriangle } from 'lucide-react';
import { PortfolioHoldingsTable } from './portfolio-holdings-table';

interface PortfolioDiscoveredSectionProps {
  discovered: PortfolioAsset[];
  enabled: boolean;
  formatBalance: (asset: PortfolioAsset) => string | null;
}

export function PortfolioDiscoveredSection({
  discovered,
  enabled,
  formatBalance,
}: PortfolioDiscoveredSectionProps) {
  const t = useT();

  if (!enabled) {
    return (
      <p className="px-4 py-6 text-center text-sm text-slate-500">
        {t('portfolio.discoveredDisabled')}
      </p>
    );
  }

  return (
    <div>
      <div className="border-b border-amber-100 bg-amber-50/80 px-4 py-3">
        <div className="flex gap-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('portfolio.discoveredDisclaimer')}</p>
        </div>
      </div>

      {discovered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {t('portfolio.discoveredEmpty')}
        </p>
      ) : (
        <PortfolioHoldingsTable holdings={discovered} formatBalance={formatBalance} />
      )}
    </div>
  );
}
