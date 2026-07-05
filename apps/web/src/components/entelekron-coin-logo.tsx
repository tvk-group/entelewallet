'use client';

import { useId } from 'react';

/** EnteleKRON mark — geometric Σ + spectrum ring, transparent background. */
export function EntelekronCoinLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sigma-${uid}`} x1="50%" y1="8%" x2="50%" y2="92%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="42%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={`ring-${uid}`} x1="8%" y1="8%" x2="92%" y2="92%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="16%" stopColor="#2563eb" />
          <stop offset="34%" stopColor="#7c3aed" />
          <stop offset="52%" stopColor="#db2777" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="88%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`ring-lit-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
        </linearGradient>
        <filter id={`sigma-glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer spectrum tube */}
      <circle cx="100" cy="100" r="82" stroke={`url(#ring-${uid})`} strokeWidth="20" />
      <circle cx="100" cy="100" r="82" stroke={`url(#ring-lit-${uid})`} strokeWidth="20" opacity="0.65" />
      <circle cx="100" cy="100" r="71" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Modern geometric Σ */}
      <path
        d="M66 56 H134 V71 H91 V89 H127 V104 H91 V122 H134 V137 H66 V122 H103 V104 H69 V89 H103 V71 H66 V56 Z"
        fill={`url(#sigma-${uid})`}
        filter={`url(#sigma-glow-${uid})`}
      />
    </svg>
  );
}

/** TVK Labs mark — atomic ribbon + wordmark, transparent background. */
export function TvkLabsCoinLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 300 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`tvk-a-${uid}`} x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="45%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`tvk-b-${uid}`} x1="90%" y1="10%" x2="10%" y2="90%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`tvk-shine-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Atomic interlocking ribbons */}
      <path
        d="M22 78 C22 48, 52 34, 68 52 C84 70, 72 96, 50 86 C36 78, 22 78, 22 78 Z"
        fill={`url(#tvk-a-${uid})`}
      />
      <path
        d="M48 48 C64 28, 92 36, 98 58 C104 78, 78 98, 56 84 C42 72, 48 48, 48 48 Z"
        fill={`url(#tvk-b-${uid})`}
      />
      <path
        d="M22 78 C22 48, 52 34, 68 52 C84 70, 72 96, 50 86 C36 78, 22 78, 22 78 Z"
        fill={`url(#tvk-shine-${uid})`}
        opacity="0.35"
      />
      <ellipse cx="62" cy="72" rx="36" ry="32" stroke="rgba(255,255,255,0.14)" strokeWidth="1.25" />

      <text
        x="118"
        y="62"
        fill="#ffffff"
        fontSize="30"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.16em"
      >
        T.V.K.
      </text>
      <text
        x="118"
        y="98"
        fill="#ffffff"
        fontSize="30"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.16em"
      >
        LABS
      </text>
      <text
        x="118"
        y="124"
        fill="rgba(226,232,240,0.8)"
        fontSize="9.5"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.2em"
      >
        INNOVARE AD FUTURUM
      </text>
    </svg>
  );
}
