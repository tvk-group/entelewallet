'use client';

import Image from 'next/image';
import { Badge, LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import type { TokenConfig } from '@entelewallet/types';
import { hasMarketQuote } from '@entelewallet/config';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatUnits } from 'viem';
import { formatUsd } from '@/hooks/use-token-prices';

interface AssetCardProps {
  token: TokenConfig;
  balance?: bigint;
  fiatUsd?: number;
  loading?: boolean;
  refreshing?: boolean;
  pricesLoading?: boolean;
  error?: string;
}

export function AssetCard({
  token,
  balance,
  fiatUsd,
  loading,
  refreshing,
  pricesLoading,
  error,
}: AssetCardProps) {
  const t = useT();

  const displayBalance =
    balance !== undefined
      ? parseFloat(formatUnits(balance, token.decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : null;

  const fiatLabel = formatUsd(fiatUsd);
  const showUnlisted = !hasMarketQuote(token) && balance !== undefined && !token.pendingOfficialConfiguration;

  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-slate-50/90">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200/90 shadow-sm">
        {token.logo ? (
          <Image
            src={token.logo}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain p-0.5"
          />
        ) : (
          <span className="text-xs font-bold text-slate-700">{token.symbol.slice(0, 3)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{token.name}</p>
          {token.pendingOfficialConfiguration && (
            <Badge variant="warning" className="shrink-0 text-[10px]">
              {t('common.pendingConfiguration')}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-slate-500">{token.symbol}</p>
      </div>

      <div className="shrink-0 text-right">
        {token.pendingOfficialConfiguration ? (
          <p className="text-xs text-slate-400">{t('common.pendingConfiguration')}</p>
        ) : loading ? (
          <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />
        ) : error ? (
          <p className="text-xs text-red-600">{t('assets.failedToLoad')}</p>
        ) : displayBalance !== null ? (
          <>
            <p
              className={`text-sm font-semibold tabular-nums text-slate-900 transition-opacity ${refreshing ? 'opacity-70' : ''}`}
            >
              <LtrSpan>{displayBalance}</LtrSpan>
              <span className="ml-1 text-xs font-normal text-slate-500">{token.symbol}</span>
            </p>
            {showUnlisted ? (
              <p className="mt-0.5 text-[11px] text-slate-400">{t('assets.noMarketPrice')}</p>
            ) : pricesLoading && fiatUsd === undefined ? (
              <p className="mt-0.5 text-[11px] text-slate-400">{t('assets.priceLoading')}</p>
            ) : fiatLabel ? (
              <p className="mt-0.5 text-xs tabular-nums text-slate-500">{fiatLabel}</p>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-slate-400">—</p>
        )}
      </div>

      {token.explorerUrl && !token.pendingOfficialConfiguration && (
        <a
          href={token.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-cyan-700"
          aria-label={t('common.viewExplorer')}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
