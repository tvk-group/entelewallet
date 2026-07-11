'use client';

import { ReactNode } from 'react';
import { cn } from '@entelewallet/utils';
import { BrandLogo } from '@/components/brand-logo';

interface WalletPhoneFrameProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

/** Phone bezel matching EnteleKRON dashboard embed — void #1e2f48 + accent #14b8a6. */
export function WalletPhoneFrame({ children, className, title }: WalletPhoneFrameProps) {
  return (
    <div
      className={cn(
        'wallet-phone-frame relative mx-auto w-full max-w-[390px]',
        className,
      )}
    >
      <div className="rounded-[2.25rem] border-[3px] border-[#0f1a2e] bg-[#0f1a2e] p-2 shadow-2xl shadow-black/40 ring-1 ring-white/5">
        <div className="mb-2 flex justify-center">
          <div className="h-1 w-14 rounded-full bg-white/15" />
        </div>
        <div className="overflow-hidden rounded-[1.75rem] bg-void">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo variant="icon" className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">EnteleWALLET</p>
                {title ? (
                  <p className="truncate text-[10px] font-medium uppercase tracking-wider text-accent">
                    {title}
                  </p>
                ) : (
                  <p className="text-[10px] text-white/50">entelewallet.app</p>
                )}
              </div>
            </div>
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
          </div>
          <div className="wallet-phone-screen max-h-[min(72vh,640px)] overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
