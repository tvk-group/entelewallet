'use client';

import { getDisplayNetworks } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useNetworkView } from '@/lib/network-view-context';
import { ChainLogo } from '@/components/chain-logo';
import { useAccount, useChainId } from 'wagmi';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type NetworkChainPickerVariant = 'panel' | 'header';

interface NetworkChainPickerProps {
  className?: string;
  variant?: NetworkChainPickerVariant;
}

/** Instant network view picker — no wallet chain switch on select. */
export function NetworkChainPicker({ className, variant = 'panel' }: NetworkChainPickerProps) {
  const t = useT();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { networkViewId, setNetworkViewId, activeNetwork } = useNetworkView();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const networks = useMemo(() => getDisplayNetworks(), []);
  const isHeader = variant === 'header';

  const grouped = useMemo(() => {
    const order = ['tvk-ecosystem', 'active', 'experimental', 'testnet'] as const;
    return order
      .map((category) => ({
        category,
        items: networks.filter((network) => network.uiCategory === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [networks]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const handleSelect = (networkId: string) => {
    setNetworkViewId(networkId);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        key={networkViewId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-2 transition',
          isHeader
            ? 'max-w-[11rem] rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1.5 text-left shadow-sm hover:border-cyan-200 hover:bg-white sm:max-w-[13rem]'
            : 'w-full justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-cyan-200 hover:shadow-md',
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('networks.switchNetwork')}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200',
            isHeader ? 'h-7 w-7' : 'h-10 w-10 shadow-sm',
          )}
        >
          <ChainLogo
            icon={activeNetwork?.icon}
            networkId={activeNetwork?.id}
            name={activeNetwork?.name}
            size={isHeader ? 20 : 40}
          />
        </div>
        <div className={cn('min-w-0 flex-1', isHeader ? 'hidden sm:block' : 'text-left')}>
          {!isHeader && (
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {t('networks.title')}
            </p>
          )}
          <p
            className={cn(
              'truncate font-semibold text-slate-900',
              isHeader ? 'text-xs' : 'text-sm',
            )}
          >
            {activeNetwork?.name ?? t('networks.title')}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'shrink-0 text-slate-400 transition',
            isHeader ? 'h-4 w-4' : 'h-5 w-5',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 max-h-[min(24rem,70vh)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl',
            isHeader ? 'right-0 w-[min(100vw-2rem,20rem)]' : 'left-0 right-0',
          )}
          role="listbox"
        >
          {!isConnected && (
            <p className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              {t('networks.connectToSwitchChain')}
            </p>
          )}
          {isConnected && (
            <p className="mb-2 rounded-lg bg-cyan-50 px-3 py-2 text-[11px] leading-relaxed text-cyan-900">
              {t('networks.instantViewHint')}
            </p>
          )}
          {grouped.map((group) => (
            <div key={group.category} className="mb-2 last:mb-0">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t(`networks.category.${group.category}`)}
              </p>
              <ul className="space-y-1">
                {group.items.map((network) => {
                  const selected = network.id === networkViewId;
                  const priceOnly = network.portfolioTier === 'price-only';
                  const walletOnNetwork = isConnected && chainId === network.chainId;
                  return (
                    <li key={network.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(network.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                          selected
                            ? 'bg-gradient-to-r from-cyan-50 to-violet-50 text-blue-900'
                            : 'hover:bg-slate-50',
                        )}
                        role="option"
                        aria-selected={selected}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                          <ChainLogo
                            icon={network.icon}
                            networkId={network.id}
                            name={network.name}
                            size={28}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{network.name}</p>
                          <p className="text-xs text-slate-500">
                            {network.nativeCurrency.symbol} · ID {network.chainId}
                            {walletOnNetwork && (
                              <span className="ml-1 text-emerald-700">· {t('networks.walletActive')}</span>
                            )}
                          </p>
                        </div>
                        {network.status === 'experimental' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                            {t('networks.experimental')}
                          </span>
                        )}
                        {network.status === 'testnet' && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {t('networks.testnet')}
                          </span>
                        )}
                        {priceOnly && (
                          <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800">
                            {t('networks.priceOnly')}
                          </span>
                        )}
                        {selected && <Check className="h-4 w-4 shrink-0 text-cyan-700" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
