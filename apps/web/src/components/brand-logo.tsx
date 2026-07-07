'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

type BrandLogoVariant = 'lockup' | 'wordmark' | 'icon' | 'banner-dark';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

/** Official EnteleWALLET brand mark — lockup (icon + wordmark), wordmark, icon, or dark banner. */
export function BrandLogo({ variant = 'lockup', className, priority }: BrandLogoProps) {
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

  if (variant === 'wordmark') {
    return (
      <Image
        src={BRAND_ASSETS.wordmark}
        alt="EnteleWALLET"
        width={200}
        height={40}
        className={cn('h-8 w-auto max-w-[180px] object-contain sm:h-9 sm:max-w-[200px]', className)}
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
    <div className={cn('flex items-center gap-2.5', className)}>
      <Image
        src={BRAND_ASSETS.iconMark}
        alt=""
        width={40}
        height={40}
        aria-hidden
        className="h-10 w-10 shrink-0 rounded-xl object-contain"
        priority={priority}
      />
      <Image
        src={BRAND_ASSETS.wordmark}
        alt="EnteleWALLET"
        width={200}
        height={40}
        className="h-8 w-auto max-w-[160px] object-contain sm:h-9 sm:max-w-[190px]"
        priority={priority}
      />
    </div>
  );
}
