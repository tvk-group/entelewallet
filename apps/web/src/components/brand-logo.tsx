'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

type BrandLogoVariant = 'horizontal' | 'icon';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ variant = 'horizontal', className, priority }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <Image
        src={BRAND_ASSETS.icon512}
        alt="EnteleWALLET"
        width={40}
        height={40}
        className={cn('h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-white/60', className)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={BRAND_ASSETS.logoHorizontal}
      alt="EnteleWALLET — Secure • Intelligent • Connected"
      width={240}
      height={56}
      className={cn('h-10 w-auto max-w-[220px] object-contain sm:h-11 sm:max-w-[260px]', className)}
      priority={priority}
    />
  );
}
