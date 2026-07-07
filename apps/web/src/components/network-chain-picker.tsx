'use client';

import Image from 'next/image';
import { getDisplayNetworks } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useNetworkView } from '@/lib/network-view-context';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export function NetworkChainPicker({ className }: { className?: string }) {
  const t = useT();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const { networkViewId, setNetworkViewId, activeNetwork } = useNetworkView();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  if (!isConnected) return null;

  const handleSelect = (networkId: string, targetChainId: number) => {
    setNetworkViewId(networkId);
    if (targetChainId !== chainId) {
      switchChain({ chainId: targetChainId });
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 shadow-sm">
            {activeNetwork?.icon ? (
              <Image
                src={activeNetwork.icon}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            ) : (
              <Globe2 className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              {t('networks.title')}
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {activeNetwork?.name ?? `Chain ${chainId}`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-slate-400 transition', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-30 mt-2 max-h-[min(24rem,60vh)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
          role="listbox"
        >
          {grouped.map((group) => (
            <div key={group.category} className="mb-2 last:mb-0">
              <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {t(`networks.category.${group.category}`)}
              </p>
              <ul className="space-y-1">
                {group.items.map((network) => {
                  const selected = network.id === networkViewId;
                  return (
                    <li key={network.id}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSelect(network.id, network.chainId)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                          selected
                            ? 'bg-gradient-to-r from-cyan-50 to-violet-50 text-blue-900'
                            : 'hover:bg-slate-50',
                          isPending && 'opacity-60',
                        )}
                        role="option"
                        aria-selected={selected}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                          <Image
                            src={network.icon}
                            alt=""
                            width={28}
                            height={28}
                            className="h-7 w-7 object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{network.name}</p>
                          <p className="text-xs text-slate-500">
                            {network.nativeCurrency.symbol} · ID {network.chainId}
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
