'use client';

import { useId } from 'react';

/** EnteleKRON mark — Σ center + spectrum ring, transparent background. */
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
        <linearGradient id={`sigma-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={`ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="18%" stopColor="#2563eb" />
          <stop offset="38%" stopColor="#7c3aed" />
          <stop offset="58%" stopColor="#db2777" />
          <stop offset="78%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        <linearGradient id={`ring-shine-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`ribbon-a-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="55%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={`ribbon-b-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Spectrum ring */}
      <circle
        cx="100"
        cy="100"
        r="78"
        stroke={`url(#ring-${uid})`}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <circle
        cx="100"
        cy="100"
        r="78"
        stroke={`url(#ring-shine-${uid})`}
        strokeWidth="18"
        opacity="0.55"
      />

      {/* Stylized Σ — EnteleKRON core mark */}
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fill={`url(#sigma-${uid})`}
        fontSize="76"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        Σ
      </text>
    </svg>
  );
}

/** TVK Labs mark for the cyber coin back face — ribbon icon + wordmark, transparent. */
export function TvkLabsCoinLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 280 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`tvk-ribbon-a-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`tvk-ribbon-b-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Interlocking ribbon loops */}
      <path
        d="M18 70 C18 38, 48 28, 62 48 C76 68, 52 88, 38 68 C28 54, 18 70, 18 70 Z"
        fill={`url(#tvk-ribbon-a-${uid})`}
        opacity="0.95"
      />
      <path
        d="M38 52 C52 32, 78 38, 82 58 C86 78, 58 92, 44 72 C36 62, 38 52, 38 52 Z"
        fill={`url(#tvk-ribbon-b-${uid})`}
        opacity="0.95"
      />
      <ellipse cx="52" cy="66" rx="34" ry="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* T.V.K. LABS wordmark */}
      <text
        x="108"
        y="58"
        fill="#ffffff"
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.14em"
      >
        T.V.K.
      </text>
      <text
        x="108"
        y="92"
        fill="#ffffff"
        fontSize="28"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.14em"
      >
        LABS
      </text>
      <text
        x="108"
        y="118"
        fill="rgba(226,232,240,0.75)"
        fontSize="9"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.18em"
      >
        INNOVARE AD FUTURUM
      </text>
    </svg>
  );
}
