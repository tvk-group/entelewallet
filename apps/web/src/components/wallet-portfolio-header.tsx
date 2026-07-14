'use client';

import Image from 'next/image';
import { truncateAddress } from '@entelewallet/utils';
import { LtrSpan } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { useNetworkView } from '@/lib/network-view-context';
import { useT } from '@/lib/i18n-context';
import { Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { WalletIdenticon } from './wallet-identicon';
import { formatUsd } from '@/hooks/use-token-prices';
import { PortfolioDisplayModeSelect } from './portfolio/portfolio-display-mode';
import type { PortfolioDisplayMode } from '@entelewallet/types';

interface WalletPortfolioHeaderProps {
  totalUsd?: number;
  isPartialTotal?: boolean;
  displayMode: PortfolioDisplayMode;
  onDisplayModeChange: (mode: PortfolioDisplayMode) => void;
  isRefreshing?: boolean;
  isEmpty?: boolean;
}

export function WalletPortfolioHeader({
  totalUsd,
  isPartialTotal,
  displayMode,
  onDisplayModeChange,
  isRefreshing,
  isEmpty,
}: WalletPortfolioHeaderProps) {
  const t = useT();
  const { address } = useAccount();
  const { activeNetwork } = useNetworkView();
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const formattedTotal = formatUsd(totalUsd);

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1220] via-blue-950 to-cyan-900 p-5 text-white shadow-xl ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <WalletIdenticon address={address} size={48} className="shadow-md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-100/75">
                {t('assets.totalBalance')}
              </p>
              {isRefreshing && (
                <Loader2 className="h-3 w-3 animate-spin text-cyan-100/70" aria-hidden />
              )}
            </div>
            <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight">
              {isEmpty ? '—' : (formattedTotal ?? '—')}
            </p>
            {isEmpty && (
              <p className="mt-1 max-w-[16rem] text-[10px] leading-snug text-cyan-100/80">
                {t('portfolio.walletEmpty')}
              </p>
            )}
            {isPartialTotal && !isEmpty && (
              <p className="mt-1 max-w-[14rem] text-[10px] leading-snug text-cyan-100/80">
                {t('assets.listedAssetsOnly')}
              </p>
            )}
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="group mt-2 inline-flex max-w-full items-center gap-2 text-left"
            >
              <LtrSpan className="truncate font-mono text-xs text-cyan-100/90">
                {truncateAddress(address)}
              </LtrSpan>
              <Copy className="h-3.5 w-3.5 shrink-0 text-cyan-100/60 transition group-hover:text-white" />
            </button>
            {copied && (
              <p className="mt-1 text-[10px] text-cyan-100">{t('assets.addressCopied')}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <PortfolioDisplayModeSelect
            value={displayMode}
            onChange={onDisplayModeChange}
            variant="header"
          />
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
            {activeNetwork?.icon ? (
              <Image
                src={activeNetwork.icon}
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px] rounded-full object-contain p-0.5 ring-1 ring-white/20"
              />
            ) : null}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-cyan-100/75">
                {t('assets.activeNetwork')}
              </p>
              <p className="text-sm font-semibold">{activeNetwork?.name ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
