'use client';

import Image from 'next/image';
import { Badge, LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import type { TokenConfig } from '@entelewallet/types';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatUnits } from 'viem';

interface AssetCardProps {
  token: TokenConfig;
  balance?: bigint;
  loading?: boolean;
  refreshing?: boolean;
  error?: string;
}

export function AssetCard({ token, balance, loading, refreshing, error }: AssetCardProps) {
  const t = useT();

  const displayBalance =
    balance !== undefined
      ? parseFloat(formatUnits(balance, token.decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : null;

  const showZero = balance !== undefined && displayBalance === '0';

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50/80">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200/80">
        {token.logo ? (
          <Image src={token.logo} alt="" width={44} height={44} className="h-11 w-11 object-cover" />
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
          <p
            className={`text-sm font-semibold text-slate-900 transition-opacity ${refreshing ? 'opacity-70' : ''}`}
          >
            <LtrSpan>{displayBalance}</LtrSpan>
            <span className="ml-1 text-xs font-normal text-slate-500">{token.symbol}</span>
          </p>
        ) : showZero ? (
          <p className="text-sm font-semibold text-slate-900">
            <LtrSpan>0</LtrSpan>
            <span className="ml-1 text-xs font-normal text-slate-500">{token.symbol}</span>
          </p>
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
