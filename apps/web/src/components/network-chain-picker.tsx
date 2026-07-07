'use client';

import Image from 'next/image';
import { getWalletConnectChains } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { useT } from '@/lib/i18n-context';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function NetworkChainPicker({ className }: { className?: string }) {
  const t = useT();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const chains = getWalletConnectChains();

  if (!isConnected) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">{t('networks.title')}</h2>
        <span className="text-xs text-slate-500">{t('networks.switchHint')}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chains.map((chain) => {
          const active = chain.chainId === chainId;
          return (
            <button
              key={chain.id}
              type="button"
              disabled={isPending || active}
              onClick={() => switchChain({ chainId: chain.chainId })}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                active
                  ? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-violet-50 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50/50',
                isPending && !active && 'opacity-60',
              )}
              aria-pressed={active}
            >
              <Image
                src={chain.icon}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-full"
              />
              <span>{chain.name}</span>
              {chain.status === 'experimental' && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  {t('networks.experimental')}
                </span>
              )}
              {chain.status === 'testnet' && (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {t('networks.testnet')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
