'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n-context';
import { ROUTES, getPublicOfficialAddresses } from '@entelewallet/config';
import { Copy, ShieldCheck } from 'lucide-react';
import { truncateAddress } from '@entelewallet/utils';

export function EmbedTransparencyView() {
  const t = useT();
  const addresses = getPublicOfficialAddresses().filter(
    (a) => a.status === 'verified' && a.address != null,
  );
  const [copied, setCopied] = useState<string | null>(null);

  async function copyAddress(id: string, address: string) {
    await navigator.clipboard.writeText(address);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-white/60">{t('transparency.safetyNotice')}</p>

      <div className="space-y-2">
        {addresses.slice(0, 4).map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs font-semibold text-white">{item.name}</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate font-mono text-[10px] text-white/70">
                {truncateAddress(item.address!)}
              </code>
              <button
                type="button"
                onClick={() => void copyAddress(item.id, item.address!)}
                className="shrink-0 rounded p-1 text-accent hover:bg-accent/10"
                aria-label={t('common.copyAddress')}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {copied === item.id && (
              <p className="mt-1 text-[10px] text-accent">{t('common.copied')}</p>
            )}
          </div>
        ))}
      </div>

      <Link
        href={ROUTES.transparency}
        className="block text-center text-xs font-medium text-accent hover:text-accent/80"
      >
        {t('common.openTransparencyCenter')} →
      </Link>
    </div>
  );
}
