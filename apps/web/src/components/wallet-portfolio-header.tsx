'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { truncateAddress } from '@entelewallet/utils';
import { LtrSpan } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { useNetworkView } from '@/lib/network-view-context';
import { useT } from '@/lib/i18n-context';
import { Copy } from 'lucide-react';
import { useState } from 'react';

export function WalletPortfolioHeader() {
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

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-800 p-5 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Image
              src={BRAND_ASSETS.iconMark}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-cyan-100/80">
              {t('assets.connectedWallet')}
            </p>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="group mt-0.5 inline-flex items-center gap-2 text-left"
            >
              <LtrSpan className="font-mono text-sm font-semibold">
                {truncateAddress(address)}
              </LtrSpan>
              <Copy className="h-3.5 w-3.5 text-cyan-100/70 transition group-hover:text-white" />
            </button>
            {copied && (
              <p className="mt-1 text-[10px] text-cyan-100">{t('assets.addressCopied')}</p>
            )}
          </div>
        </div>
        <div className="rounded-xl bg-white/10 px-3 py-2 text-right ring-1 ring-white/15">
          <p className="text-[10px] uppercase tracking-wider text-cyan-100/80">
            {t('assets.activeNetwork')}
          </p>
          <p className="text-sm font-semibold">{activeNetwork?.name ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
