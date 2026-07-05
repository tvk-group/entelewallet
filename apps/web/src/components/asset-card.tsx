'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import type { TokenConfig } from '@entelewallet/types';
import { ExternalLink } from 'lucide-react';
import { formatUnits } from 'viem';

interface AssetCardProps {
  token: TokenConfig;
  balance?: bigint;
  loading?: boolean;
  error?: string;
}

export function AssetCard({ token, balance, loading, error }: AssetCardProps) {
  const t = useT();

  const displayBalance =
    balance !== undefined
      ? parseFloat(formatUnits(balance, token.decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : null;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-violet-100 text-sm font-bold text-cyan-800">
            {token.symbol.slice(0, 3)}
          </div>
          <div>
            <CardTitle className="text-base">{token.name}</CardTitle>
            <p className="text-xs text-slate-500">
              {token.symbol} · {token.network}
            </p>
          </div>
        </div>
        {token.pendingOfficialConfiguration && (
          <Badge variant="warning">{t('common.pendingConfiguration')}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {token.pendingOfficialConfiguration ? (
          <p className="text-sm text-slate-500">{t('common.pendingConfiguration')}</p>
        ) : loading ? (
          <p className="text-sm text-slate-400">{t('common.loading')}</p>
        ) : error ? (
          <p className="text-sm text-red-600">{t('assets.failedToLoad')}</p>
        ) : displayBalance !== null ? (
          <p className="text-2xl font-semibold text-slate-900">
            <LtrSpan>{displayBalance}</LtrSpan>{' '}
            <span className="text-base font-normal text-slate-500">{token.symbol}</span>
          </p>
        ) : token.isNative ? (
          <p className="text-sm text-slate-500">{t('assets.nativeAsset')}</p>
        ) : (
          <p className="text-sm text-slate-500">—</p>
        )}

        {token.contractAddress && (
          <p className="mt-2 text-xs text-slate-400">
            {t('assets.contract')}:{' '}
            <LtrSpan>{`${token.contractAddress.slice(0, 8)}…${token.contractAddress.slice(-6)}`}</LtrSpan>
          </p>
        )}

        {token.explorerUrl && (
          <a
            href={token.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-700 hover:text-cyan-900"
          >
            {t('common.viewExplorer')} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
