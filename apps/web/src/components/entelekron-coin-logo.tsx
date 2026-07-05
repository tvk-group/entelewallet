/** EnteleKRON emblem for the cyber coin face — ENK diamond mark. */
export function EntelekronCoinLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="enk-diamond" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="45%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="enk-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
        </linearGradient>
        <filter id="enk-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M60 10 L104 60 L60 110 L16 60 Z"
        fill="url(#enk-diamond)"
        filter="url(#enk-glow)"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
      />
      <path
        d="M60 22 L88 60 L60 98 L32 60 Z"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />
      <path
        d="M60 10 L104 60 L60 110 L16 60 Z"
        fill="url(#enk-shine)"
        opacity="0.6"
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="26"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.08em"
      >
        ENK
      </text>
    </svg>
  );
}
