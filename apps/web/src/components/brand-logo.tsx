'use client';

import Image from 'next/image';
import { BRAND_ASSETS } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

type BrandLogoVariant = 'horizontal' | 'horizontal-dark' | 'icon';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ variant = 'horizontal-dark', className, priority }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <Image
        src={BRAND_ASSETS.icon512}
        alt="EnteleWALLET"
        width={44}
        height={44}
        className={cn('h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-white/50', className)}
        priority={priority}
      />
    );
  }

  const src =
    variant === 'horizontal' ? BRAND_ASSETS.logoHorizontal : BRAND_ASSETS.logoDark;

  return (
    <Image
      src={src}
      alt="EnteleWALLET — Secure • Intelligent • Connected"
      width={320}
      height={72}
      className={cn(
        'h-auto w-full max-w-[280px] object-contain sm:max-w-[320px]',
        variant === 'horizontal-dark' && 'rounded-xl',
        className,
      )}
      priority={priority}
    />
  );
}
