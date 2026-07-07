'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { useT } from '@/lib/i18n-context';

export function PwaInstallMockup() {
  const t = useT();

  return (
    <div className="relative isolate mx-auto max-w-[320px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl sm:max-w-[380px]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="animated-orb absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-200/30 blur-2xl" />
      </div>
      <div className="relative z-10 p-6">
        <div className="wallet-animation mx-auto w-[180px] rounded-[2rem] border-4 border-slate-800 bg-slate-900 p-3 shadow-2xl sm:w-[200px]">
          <div className="mb-3 flex justify-center">
            <div className="h-1.5 w-12 rounded-full bg-slate-700" />
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-cyan-700 to-violet-700 p-4 text-center">
            <Image
              src={BRAND_ASSETS.appIcon}
              alt="EnteleWALLET"
              width={56}
              height={56}
              className="mx-auto mb-2 h-14 w-14 rounded-full object-cover shadow-lg ring-2 ring-white/30"
            />
            <p className="text-xs font-bold text-white">EnteleWALLET</p>
            <p className="mt-1 text-[10px] text-white/80">entelewallet.app</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">{t('install.description')}</p>
      </div>
    </div>
  );
}
