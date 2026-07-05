'use client';

import Image from 'next/image';
import { cn } from '@entelewallet/utils';
import { EntelekronCoinLogo } from './entelekron-coin-logo';

interface EcosystemCyberCoinProps {
  modules?: string[];
  className?: string;
}

const COIN_EDGE_COUNT = 36;
const COIN_RADIUS = 108;

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  left: `${8 + ((i * 37) % 84)}%`,
  top: `${10 + ((i * 53) % 75)}%`,
  delay: `${(i * 0.41) % 6}s`,
  duration: `${4 + (i % 5)}s`,
  size: 2 + (i % 3),
}));

export function EcosystemCyberCoin({ modules = [], className }: EcosystemCyberCoinProps) {
  return (
    <div
      className={cn(
        'ecosystem-cyber-coin relative mx-auto mt-10 w-full max-w-4xl overflow-hidden rounded-[2rem]',
        className,
      )}
      aria-hidden
    >
      <div className="cyber-coin-bg absolute inset-0" />
      <div className="cyber-coin-hexgrid absolute inset-0" />
      <div className="cyber-coin-floor-glow absolute inset-x-0 bottom-0 h-1/2" />
      <div className="cyber-coin-scanline absolute inset-0" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="cyber-coin-particle absolute rounded-full bg-cyan-300"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center px-4 py-10 sm:py-14">
        <div className="cyber-coin-stage">
          <div className="cyber-coin-spinner">
            <div className="cyber-coin-body">
              <div className="cyber-coin-face cyber-coin-face-front">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <EntelekronCoinLogo className="h-24 w-24 sm:h-28 sm:w-28" />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-100/90 sm:text-xs">
                    EnteleKRON
                  </p>
                </div>
              </div>

              <div className="cyber-coin-face cyber-coin-face-back">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-cyan-400/40 sm:h-20 sm:w-20">
                    <Image
                      src="/icons/icon-512.png"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-violet-100/90 sm:text-xs">
                    TVK Group
                  </p>
                </div>
              </div>

              {Array.from({ length: COIN_EDGE_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="cyber-coin-edge"
                  style={{
                    transform: `rotateY(${(360 / COIN_EDGE_COUNT) * i}deg) translateZ(${COIN_RADIUS}px)`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="cyber-coin-halo" />
          <div className="cyber-coin-reflection" />
        </div>

        <p className="mt-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
          EnteleKRON · ENK
        </p>

        {modules.length > 0 && (
          <ul className="mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
            {modules.map((name) => (
              <li
                key={name}
                className="rounded-full border border-cyan-500/25 bg-slate-900/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-100/80 backdrop-blur-sm sm:text-xs"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
