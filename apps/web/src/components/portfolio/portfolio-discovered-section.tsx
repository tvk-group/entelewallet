'use client';

import { useT } from '@/lib/i18n-context';
import type { PortfolioAsset } from '@entelewallet/types';
import { AlertTriangle, EyeOff } from 'lucide-react';
import { PortfolioHoldingsTable } from './portfolio-holdings-table';

interface PortfolioDiscoveredSectionProps {
  discovered: PortfolioAsset[];
  enabled: boolean;
  loading?: boolean;
  formatBalance: (asset: PortfolioAsset) => string | null;
  onDismiss?: (contractAddress: string, chainId?: number) => void;
}

export function PortfolioDiscoveredSection({
  discovered,
  enabled,
  loading,
  formatBalance,
  onDismiss,
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

      {loading ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">{t('common.loading')}</p>
      ) : discovered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {t('portfolio.discoveredEmpty')}
        </p>
      ) : (
        <div>
          <PortfolioHoldingsTable holdings={discovered} formatBalance={formatBalance} />
          <ul className="border-t border-slate-100 px-4 py-2">
            {discovered.map((asset) =>
              asset.contractAddress && onDismiss ? (
                <li key={`hide-${asset.id}`} className="flex justify-end py-1">
                  <button
                    type="button"
                    onClick={() => onDismiss(asset.contractAddress!, asset.chainId)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    {t('portfolio.hideToken')} {asset.symbol}
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
