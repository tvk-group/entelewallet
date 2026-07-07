'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

type BrandLogoVariant = 'full' | 'icon' | 'app-icon' | 'banner-dark' | 'lockup-dark';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

/** Official EnteleWALLET brand mark. */
export function BrandLogo({ variant = 'full', className, priority }: BrandLogoProps) {
  if (variant === 'full') {
    return (
      <Image
        src={BRAND_ASSETS.logoFull}
        alt="EnteleWALLET — Secure • Intelligent • Connected"
        width={360}
        height={88}
        className={cn('h-auto w-full max-w-[280px] object-contain sm:max-w-[340px]', className)}
        priority={priority}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <Image
        src={BRAND_ASSETS.iconMark}
        alt="EnteleWALLET"
        width={44}
        height={44}
        className={cn('h-11 w-11 rounded-xl object-contain', className)}
        priority={priority}
      />
    );
  }

  if (variant === 'app-icon') {
    return (
      <Image
        src={BRAND_ASSETS.appIcon}
        alt="EnteleWALLET"
        width={44}
        height={44}
        className={cn('h-11 w-11 rounded-xl object-cover shadow-sm ring-1 ring-cyan-400/20', className)}
        priority={priority}
      />
    );
  }

  if (variant === 'banner-dark') {
    return (
      <Image
        src={BRAND_ASSETS.logoDark}
        alt="EnteleWALLET — Secure • Intelligent • Connected"
        width={360}
        height={80}
        className={cn('h-auto w-full max-w-[320px] object-contain sm:max-w-[380px]', className)}
        priority={priority}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl bg-[#0a1628] px-3 py-1.5 shadow-sm ring-1 ring-slate-800/80',
        className,
      )}
    >
      <Image
        src={BRAND_ASSETS.appIcon}
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="h-9 w-9 shrink-0 rounded-xl object-cover"
        priority={priority}
      />
      <Image
        src={BRAND_ASSETS.wordmarkDark}
        alt="EnteleWALLET"
        width={200}
        height={40}
        className="h-8 w-auto max-w-[150px] object-contain sm:max-w-[180px]"
        priority={priority}
      />
    </div>
  );
}
