'use client';

import Image from 'next/image';
import { useState } from 'react';
import { resolveChainIcon } from '@entelewallet/config';
import { cn } from '@entelewallet/utils';
import { Globe2 } from 'lucide-react';

interface ChainLogoProps {
  icon?: string;
  networkId?: string;
  name?: string;
  size?: number;
  className?: string;
}

export function ChainLogo({ icon, networkId, name, size = 28, className }: ChainLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveChainIcon({ icon, networkId });

  if (!src || failed) {
    return (
      <Globe2
        className={cn('text-slate-400', className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={name ?? ''}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      unoptimized={src.startsWith('http')}
    />
  );
}
