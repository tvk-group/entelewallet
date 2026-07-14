'use client';

import { getDisplayNetworks } from '@entelewallet/config';
import { isWagmiConnectChain } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useNetworkView } from '@/lib/network-view-context';
import { ChainLogo } from '@/components/chain-logo';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Check, Loader2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

export function PortfolioNetworksGrid() {
  const t = useT();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChainAsync, isPending } = useSwitchChain();
  const { networkViewId, setNetworkViewId } = useNetworkView();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

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

  const handleSelectView = (networkId: string) => {
    setNetworkViewId(networkId);
    setSwitchError(null);
  };

  const handleSwitchWallet = async (
    event: React.MouseEvent,
    networkId: string,
    targetChainId: number,
  ) => {
    event.stopPropagation();
    if (!isConnected || !isWagmiConnectChain(targetChainId)) return;
    if (targetChainId === chainId) return;

    setSwitchingId(networkId);
    setSwitchError(null);
    try {
      await switchChainAsync({ chainId: targetChainId });
      setNetworkViewId(networkId);
    } catch {
      setSwitchError(t('networks.switchFailed'));
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {!isConnected && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
          {t('networks.connectToSwitchChain')}
        </p>
      )}
      {switchError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">{switchError}</p>
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
              const canSwitch =
                isConnected &&
                isWagmiConnectChain(network.chainId) &&
                network.portfolioTier !== 'price-only';
              const isSwitching = switchingId === network.id && isPending;

              return (
                <li key={network.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectView(network.id)}
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
                      <p className="truncate text-xs font-semibold text-slate-900">{network.name}</p>
                      <p className="truncate text-[10px] text-slate-500">
                        {network.nativeCurrency.symbol}
                      </p>
                    </div>
                    {network.status === 'experimental' && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-800">
                        {t('networks.experimental')}
                      </span>
                    )}
                    {network.portfolioTier === 'price-only' && (
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-violet-800">
                        {t('networks.priceOnly')}
                      </span>
                    )}
                    {canSwitch && !walletOnNetwork && (
                      <button
                        type="button"
                        disabled={isSwitching}
                        onClick={(e) => void handleSwitchWallet(e, network.id, network.chainId)}
                        className="mt-1 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-medium text-slate-600 hover:border-cyan-200 disabled:opacity-60"
                      >
                        {isSwitching ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Wallet className="h-3 w-3" />
                        )}
                        {t('networks.switchWallet')}
                      </button>
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
