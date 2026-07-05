'use client';

import { useId } from 'react';

/** ENK + EnteleKRON mark for the cyber coin front face. */
export function EntelekronCoinLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`enk-diamond-${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={`enk-shine-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`enk-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="80" cy="80" r="74" stroke="rgba(103,232,249,0.2)" strokeWidth="1" fill="none" />

      <path
        d="M80 18 L132 80 L80 142 L28 80 Z"
        fill={`url(#enk-diamond-${uid})`}
        filter={`url(#enk-glow-${uid})`}
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.75"
      />
      <path
        d="M80 32 L112 80 L80 128 L48 80 Z"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.25"
      />
      <path d="M80 18 L132 80 L80 142 L28 80 Z" fill={`url(#enk-shine-${uid})`} opacity="0.55" />

      <text
        x="80"
        y="88"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="30"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.12em"
      >
        ENK
      </text>

      <text
        x="80"
        y="118"
        textAnchor="middle"
        fill="rgba(224,242,254,0.95)"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.22em"
      >
        ENTELEKRON
      </text>
    </svg>
  );
}

export function TvkCoinMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="block bg-gradient-to-b from-white via-cyan-100 to-violet-200 bg-clip-text text-5xl font-black tracking-[0.22em] text-transparent sm:text-6xl">
        TVK
      </span>
      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.42em] text-cyan-100/75 sm:text-[10px]">
        Group
      </span>
    </div>
  );
}
