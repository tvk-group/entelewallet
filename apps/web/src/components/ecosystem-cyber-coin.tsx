'use client';

import { useMemo } from 'react';
import { cn } from '@entelewallet/utils';
import { EntelekronCoinLogo, TvkLabsCoinLogo } from './entelekron-coin-logo';

export const ECOSYSTEM_MODULES = [
  'SOVRA',
  'EnergieMIND ENM',
  'EnteleWALLET',
  'EnteleSCAN',
  'EnteleLINK',
  'EnteleLEDGER',
  'EnteleCLOS',
  'EnteleVAULT',
  'TVKWALLET',
  'TVK ID',
  'TVK CyberLab',
  'GraphVAULT',
  'ChronoSEAL',
  'KRON Payment Systems',
  'KRON Ecosystem Assets',
  'ALVINA',
  'Ava Sante',
  'Ava Sentient',
  'Cerebthra',
  'Cognethra',
  'Sentient Signals',
  'eKRON',
  'SoviKRON',
  'AlviKRON',
  'MineKRON',
  'WarpKRON',
  'PuppyKRON',
  'PuriKRON',
] as const;

interface EcosystemCyberCoinProps {
  className?: string;
}

const COIN_EDGE_COUNT = 36;
const HUB_SIZE = 1000;
const HUB_CENTER = HUB_SIZE / 2;
/** Coin radius in viewBox units (324px coin in ~960px hub). */
const COIN_VIEWBOX_R = 168;

const ORBIT_RINGS = [
  { radius: 0.58, offsetDeg: 0, duration: 88 },
  { radius: 0.68, offsetDeg: 25.7, duration: 104 },
  { radius: 0.78, offsetDeg: 0, duration: 120 },
  { radius: 0.88, offsetDeg: 25.7, duration: 136 },
] as const;

type RingLayout = {
  ringIndex: number;
  radius: number;
  offsetDeg: number;
  duration: number;
  reverse: boolean;
  modules: string[];
};

function buildRingLayouts(modules: readonly string[]): RingLayout[] {
  const perRing = Math.ceil(modules.length / ORBIT_RINGS.length);
  return ORBIT_RINGS.map((ring, ringIndex) => ({
    ringIndex,
    radius: ring.radius,
    offsetDeg: ring.offsetDeg,
    duration: ring.duration,
    reverse: ringIndex % 2 === 1,
    modules: modules.slice(ringIndex * perRing, ringIndex * perRing + perRing),
  }));
}

function polarToHub(angleDeg: number, radiusFrac: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const r = radiusFrac * (HUB_SIZE / 2);
  return {
    x: HUB_CENTER + Math.cos(angleRad) * r,
    y: HUB_CENTER + Math.sin(angleRad) * r,
  };
}

function signalEndpoints(angleDeg: number, radiusFrac: number) {
  const outer = polarToHub(angleDeg, radiusFrac);
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x1: HUB_CENTER + Math.cos(angleRad) * COIN_VIEWBOX_R,
    y1: HUB_CENTER + Math.sin(angleRad) * COIN_VIEWBOX_R,
    x2: outer.x,
    y2: outer.y,
  };
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  left: `${6 + ((i * 31) % 88)}%`,
  top: `${8 + ((i * 47) % 84)}%`,
  delay: `${(i * 0.33) % 5}s`,
  duration: `${3.5 + (i % 4)}s`,
  size: 1 + (i % 3),
}));

function OrbitRing({
  layout,
  globalOffset,
}: {
  layout: RingLayout;
  globalOffset: number;
}) {
  const count = layout.modules.length;
  const step = 360 / count;

  return (
    <div
      className={cn('cyber-orbit-ring-layer', layout.reverse && 'cyber-orbit-ring-layer-reverse')}
      style={
        {
          '--orbit-duration': `${layout.duration}s`,
          '--orbit-radius': `${layout.radius * 50}%`,
        } as React.CSSProperties
      }
    >
      <svg
        className="cyber-orbit-ring-signals absolute inset-0 h-full w-full"
        viewBox={`0 0 ${HUB_SIZE} ${HUB_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {layout.modules.map((name, i) => {
          const angle = layout.offsetDeg + step * i;
          const { x1, y1, x2, y2 } = signalEndpoints(angle, layout.radius);
          const delay = ((globalOffset + i) * 0.19) % 3.5;

          return (
            <g key={name}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="cyber-signal-line"
                style={{ animationDelay: `${delay}s` }}
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="cyber-signal-pulse"
                style={{ animationDelay: `${delay + 0.35}s` }}
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="cyber-signal-glow"
                style={{ animationDelay: `${delay + 0.15}s` }}
              />
              <circle r="5" fill="#a5f3fc" className="cyber-signal-node">
                <animateMotion
                  dur={`${2.2 + (i % 3) * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M ${x1} ${y1} L ${x2} ${y2}`}
                  begin={`${delay}s`}
                />
              </circle>
            </g>
          );
        })}
      </svg>

      {layout.modules.map((name, i) => {
        const angle = layout.offsetDeg + step * i;
        const delay = ((globalOffset + i) * 0.19) % 3.5;

        return (
          <div
            key={name}
            className={cn(
              'cyber-orbit-chip-slot',
              layout.ringIndex <= 1 ? 'cyber-orbit-chip-slot-inner' : 'cyber-orbit-chip-slot-outer',
            )}
            style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * var(--orbit-radius)))` }}
          >
            <div
              className="cyber-orbit-chip"
              style={
                {
                  transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                } as React.CSSProperties
              }
            >
              <span
                className="cyber-orbit-chip-label"
                style={{ animationDelay: `${delay}s` }}
              >
                {name}
              </span>
              <span className="cyber-orbit-chip-ping" style={{ animationDelay: `${delay}s` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EcosystemCyberCoin({ className }: EcosystemCyberCoinProps) {
  const ringLayouts = useMemo(() => buildRingLayouts(ECOSYSTEM_MODULES), []);
  let moduleOffset = 0;

  return (
    <div
      className={cn(
        'ecosystem-cyber-coin relative mx-auto mt-10 w-full max-w-[960px] overflow-hidden rounded-[2rem]',
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

      <div className="cyber-ecosystem-hub relative z-10 mx-auto aspect-square w-full max-w-[960px]">
        <svg
          className="cyber-signal-layer absolute inset-0 h-full w-full"
          viewBox={`0 0 ${HUB_SIZE} ${HUB_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <radialGradient id="signal-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
          </defs>
          <circle cx={HUB_CENTER} cy={HUB_CENTER} r={COIN_VIEWBOX_R + 24} fill="url(#signal-core-glow)" />
          {ORBIT_RINGS.map((ring, i) => (
            <ellipse
              key={i}
              cx={HUB_CENTER}
              cy={HUB_CENTER}
              rx={ring.radius * (HUB_SIZE / 2)}
              ry={ring.radius * (HUB_SIZE / 2) * 0.96}
              className="cyber-orbit-track"
              style={{ animationDelay: `${i * 0.8}s` }}
            />
          ))}
        </svg>

        <div
          className="cyber-coin-stage"
          style={{ '--coin-diameter': 'min(324px, 34vw)' } as React.CSSProperties}
        >
          <div className="cyber-coin-spinner">
            <div className="cyber-coin-body">
              <div className="cyber-coin-face cyber-coin-face-front">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <EntelekronCoinLogo className="cyber-coin-logo-mark" />
                </div>
              </div>

              <div className="cyber-coin-face cyber-coin-face-back">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <TvkLabsCoinLogo className="cyber-coin-logo-mark cyber-coin-logo-mark-tvk" />
                </div>
              </div>

              {Array.from({ length: COIN_EDGE_COUNT }, (_, i) => (
                <div
                  key={i}
                  className="cyber-coin-edge"
                  style={{ '--edge-angle': `${(360 / COIN_EDGE_COUNT) * i}deg` } as React.CSSProperties}
                />
              ))}
            </div>
          </div>

          <div className="cyber-coin-halo" />
          <div className="cyber-coin-reflection" />
        </div>

        {ringLayouts.map((layout) => {
          const offset = moduleOffset;
          moduleOffset += layout.modules.length;
          return (
            <OrbitRing key={layout.ringIndex} layout={layout} globalOffset={offset} />
          );
        })}
      </div>
    </div>
  );
}
