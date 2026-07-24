'use client';

import { getDisplayNetworks } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useNetworkView } from '@/lib/network-view-context';
import { ChainLogo } from '@/components/chain-logo';
import { useAccount, useChainId } from 'wagmi';
import { Check } from 'lucide-react';
import { useMemo } from 'react';

/** Instant network view picker — portfolio updates immediately via read-only RPC. */
export function PortfolioNetworksGrid() {
  const t = useT();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { networkViewId, setNetworkViewId } = useNetworkView();

  const networks = useMemo(() => getDisplayNetworks(), []);

  const grouped = useMemo(() => {
    const order = ['tvk-ecosystem', 'active', 'experimental', 'testnet'] as const;
    return order
      .map((category) => ({
        category,
        items: networks.filter((network) => network.uiCategory === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [networks]);

  return (
    <div className="space-y-4 p-4">
      {isConnected && (
        <p className="rounded-lg bg-cyan-50 px-3 py-2 text-[11px] leading-relaxed text-cyan-900">
          {t('networks.instantViewHint')}
        </p>
      )}
      {!isConnected && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
          {t('networks.connectToSwitchChain')}
        </p>
      )}
      {grouped.map((group) => (
        <div key={group.category}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t(`networks.category.${group.category}`)}
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.items.map((network) => {
              const selected = network.id === networkViewId;
              const walletOnNetwork = isConnected && chainId === network.chainId;
              const priceOnly = network.portfolioTier === 'price-only';

              return (
                <li key={network.id}>
                  <button
                    type="button"
                    onClick={() => setNetworkViewId(network.id)}
                    className={cn(
                      'relative flex w-full flex-col items-center gap-2 rounded-xl border px-3 py-3 text-center transition',
                      selected
                        ? 'border-cyan-300 bg-gradient-to-b from-cyan-50 to-violet-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-cyan-200 hover:shadow-sm',
                    )}
                  >
                    {selected && (
                      <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-cyan-700" />
                    )}
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                      <ChainLogo
                        icon={network.icon}
                        networkId={network.id}
                        name={network.name}
                        size={36}
                      />
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {network.name}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {network.nativeCurrency.symbol}
                      </p>
                    </div>
                    {network.status === 'experimental' && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-800">
                        {t('networks.experimental')}
                      </span>
                    )}
                    {priceOnly && (
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-800">
                        {t('networks.priceOnly')}
                      </span>
                    )}
                    {walletOnNetwork && (
                      <span className="text-[9px] font-medium text-emerald-700">
                        {t('networks.walletActive')}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
