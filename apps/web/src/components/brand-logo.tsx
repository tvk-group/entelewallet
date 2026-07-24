'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

type BrandLogoVariant =
  'lockup' | 'lockup-dark' | 'wordmark' | 'wordmark-dark' | 'icon' | 'app-icon' | 'banner-dark';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

/** Official EnteleWALLET brand mark. */
export function BrandLogo({ variant = 'lockup', className, priority }: BrandLogoProps) {
  if (variant === 'app-icon') {
    return (
      <Image
        src={BRAND_ASSETS.appIcon}
        alt="EnteleWALLET"
        width={44}
        height={44}
        className={cn(
          'h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-cyan-400/30',
          className,
        )}
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

  if (variant === 'wordmark-dark') {
    return (
      <Image
        src={BRAND_ASSETS.wordmarkDark}
        alt="EnteleWALLET"
        width={220}
        height={44}
        className={cn('h-9 w-auto max-w-[200px] object-contain sm:max-w-[230px]', className)}
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

  if (variant === 'lockup') {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <Image
          src={BRAND_ASSETS.appIcon}
          alt=""
          width={40}
          height={40}
          aria-hidden
          className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200/80"
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
        className="h-9 w-9 shrink-0 rounded-full object-cover"
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
