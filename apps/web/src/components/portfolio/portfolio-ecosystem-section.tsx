'use client';

import Link from 'next/link';
import { Badge, Button, LtrSpan } from '@entelewallet/ui';
import { DOMAIN_CONFIG, ROUTES } from '@entelewallet/config';
import { useT } from '@/lib/i18n-context';
import type { EcosystemAsset } from '@entelewallet/types';
import { formatUsd } from '@/hooks/use-token-prices';
import { TokenLogo } from '@/components/token-logo';
import { ExternalLink } from 'lucide-react';
import { formatUnits } from 'viem';

interface PortfolioEcosystemSectionProps {
  assets: EcosystemAsset[];
}

export function PortfolioEcosystemSection({ assets }: PortfolioEcosystemSectionProps) {
  const t = useT();

  if (assets.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-slate-500">{t('portfolio.ecosystemEmpty')}</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {assets.map((asset) => {
        const balance =
          asset.balance !== undefined
            ? parseFloat(formatUnits(BigInt(asset.balance), 18)).toLocaleString(undefined, {
                maximumFractionDigits: 4,
              })
            : null;

        return (
          <li key={asset.symbol} className="px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                <TokenLogo symbol={asset.symbol} name={asset.name} logo={asset.logo} size={44} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                  <Badge variant="info">{asset.symbol}</Badge>
                  {asset.pendingOfficialConfiguration && (
                    <Badge variant="warning" className="text-[10px]">
                      {t('common.pendingConfiguration')}
                    </Badge>
                  )}
                </div>
                {balance ? (
                  <p className="mt-1 text-sm tabular-nums text-slate-700">
                    <LtrSpan>{balance}</LtrSpan> {asset.symbol}
                    {asset.valueUsd !== undefined && (
                      <span className="ml-2 text-xs text-slate-500">{formatUsd(asset.valueUsd)}</span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{t('portfolio.ecosystemNoBalance')}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {asset.vestingLinked
                    ? asset.lockupSummary
                    : t('portfolio.ecosystemVestingHint')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={ROUTES.vesting}>
                    <Button size="sm" variant="secondary">
                      {t('nav.vesting')}
                    </Button>
                  </Link>
                  <a
                    href={DOMAIN_CONFIG.investorAppDashboard}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="ghost" className="gap-1.5">
                      {t('common.linkInvestorAccount')}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
