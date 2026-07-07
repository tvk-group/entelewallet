'use client';

import { cn } from '@entelewallet/utils';

/** Deterministic address avatar (MetaMask-style identicon colors). */
export function WalletIdenticon({
  address,
  className,
  size = 44,
}: {
  address: string;
  className?: string;
  size?: number;
}) {
  const seed = address.toLowerCase().replace('0x', '');
  const hue1 = parseInt(seed.slice(0, 6), 16) % 360;
  const hue2 = (hue1 + 120) % 360;
  const hue3 = (hue1 + 240) % 360;

  return (
    <div
      className={cn('shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/25', className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 45deg, hsl(${hue1} 70% 45%), hsl(${hue2} 65% 50%), hsl(${hue3} 70% 42%))`,
      }}
      aria-hidden
    />
  );
}
