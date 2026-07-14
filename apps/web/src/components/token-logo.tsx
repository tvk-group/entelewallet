'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { resolveTokenLogo } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';

interface TokenLogoProps {
  symbol: string;
  name?: string;
  logo?: string;
  coingeckoId?: string;
  size?: number;
  className?: string;
}

export function TokenLogo({
  symbol,
  name,
  logo,
  coingeckoId,
  size = 32,
  className,
}: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveTokenLogo({ logo, coingeckoId, symbol });

  useEffect(() => {
    setFailed(false);
  }, [logo, coingeckoId, symbol, src]);

  if (!src || failed) {
    return (
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600',
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(8, size * 0.28) }}
        aria-hidden
      >
        {symbol.slice(0, 3)}
      </span>
    );
  }

  return (
    <Image
      key={`${symbol}-${src}`}
      src={src}
      alt={name ?? symbol}
      width={size}
      height={size}
      className={cn('rounded-full object-contain', className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      unoptimized={src.startsWith('http')}
    />
  );
}
