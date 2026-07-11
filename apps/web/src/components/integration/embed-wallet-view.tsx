'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { NetworkChainPicker } from '@/components/network-chain-picker';
import { WalletPortfolioHeader } from '@/components/wallet-portfolio-header';
import { AssetGrid } from '@/components/asset-grid';
import { Wallet } from 'lucide-react';

export function EmbedWalletView() {
  const t = useT();
  const { isConnected, status } = useAccount();

  return (
    <div className="space-y-4">
      <p className="text-center text-[11px] leading-relaxed text-white/60">
        {t('integration.embedReadOnlyNotice')}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <WalletConnectButton className="!w-full !justify-center sm:!w-auto" />
        <NetworkChainPicker variant="embed" className="w-full" />
      </div>

      {status === 'reconnecting' ? (
        <p className="py-8 text-center text-sm text-white/50">{t('common.loading')}</p>
      ) : !isConnected ? (
        <div className="rounded-xl border border-dashed border-accent/30 bg-white/5 px-4 py-8 text-center">
          <Wallet className="mx-auto mb-3 h-10 w-10 text-accent/70" />
          <p className="text-sm text-white/70">{t('integration.embedConnectHint')}</p>
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              {t('integration.embedBalances')}
            </p>
            {['ENK', 'ETH', 'USDC'].map((symbol) => (
              <div
                key={symbol}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
              >
                <span className="font-medium text-white/80">{symbol}</span>
                <span className="font-mono text-white/40">{t('integration.embedPlaceholderBalance')}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3 [&_.rounded-2xl]:!border-white/10 [&_.bg-white]:!bg-white/5 [&_.text-slate-500]:!text-white/50 [&_.text-slate-900]:!text-white">
          <WalletPortfolioHeader />
          <AssetGrid />
        </div>
      )}

      <Link
        href={ROUTES.overview}
        className="block text-center text-xs font-medium text-accent hover:text-accent/80"
      >
        {t('common.openApp')} →
      </Link>
    </div>
  );
}
