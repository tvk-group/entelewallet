'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { cn } from '@entelewallet/utils';

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
const HUB_SIZE = 960;
const HUB_CENTER = HUB_SIZE / 2;
/** 243px coin mapped into 960px hub viewBox. */
const COIN_VIEWBOX_R = 121.5;

/** Static rings outside the coin — radius as % of hub half-height for responsive scaling. */
const CHIP_RING_LAYOUT = [
  { radiusPct: 39.2, offsetDeg: -90 },
  { radiusPct: 56.7, offsetDeg: -72 },
  { radiusPct: 74.2, offsetDeg: -90 },
] as const;

type ChipPlacement = {
  name: string;
  angleDeg: number;
  radiusPct: number;
  ringIndex: number;
  index: number;
};

function buildChipPlacements(modules: readonly string[]): ChipPlacement[] {
  const perRing = Math.ceil(modules.length / CHIP_RING_LAYOUT.length);
  const placements: ChipPlacement[] = [];

  CHIP_RING_LAYOUT.forEach((ring, ringIndex) => {
    const ringModules = modules.slice(ringIndex * perRing, ringIndex * perRing + perRing);
    const step = 360 / ringModules.length;

    ringModules.forEach((name, i) => {
      placements.push({
        name,
        angleDeg: ring.offsetDeg + step * i,
        radiusPct: ring.radiusPct,
        ringIndex,
        index: placements.length,
      });
    });
  });

  return placements;
}

function polarToHub(angleDeg: number, radiusFrac: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const r = radiusFrac * (HUB_SIZE / 2);
  return {
    x: HUB_CENTER + Math.cos(angleRad) * r,
    y: HUB_CENTER + Math.sin(angleRad) * r,
  };
}

function signalEndpoints(angleDeg: number, radiusPct: number) {
  const outer = polarToHub(angleDeg, radiusPct / 100);
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x1: HUB_CENTER + Math.cos(angleRad) * COIN_VIEWBOX_R,
    y1: HUB_CENTER + Math.sin(angleRad) * COIN_VIEWBOX_R,
    x2: outer.x,
    y2: outer.y,
  };
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${8 + ((i * 29) % 84)}%`,
  top: `${10 + ((i * 41) % 80)}%`,
  delay: `${(i * 0.41) % 4.5}s`,
  duration: `${4 + (i % 3)}s`,
  size: 1 + (i % 2),
}));

export function EcosystemCyberCoin({ className }: EcosystemCyberCoinProps) {
  const chipPlacements = useMemo(() => buildChipPlacements(ECOSYSTEM_MODULES), []);

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
              <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
          </defs>

          <circle cx={HUB_CENTER} cy={HUB_CENTER} r={COIN_VIEWBOX_R + 18} fill="url(#signal-core-glow)" />

          {CHIP_RING_LAYOUT.map((ring, i) => (
            <ellipse
              key={i}
              cx={HUB_CENTER}
              cy={HUB_CENTER}
              rx={(ring.radiusPct / 100) * (HUB_SIZE / 2)}
              ry={(ring.radiusPct / 100) * (HUB_SIZE / 2)}
              className="cyber-orbit-track cyber-orbit-track-static"
            />
          ))}

          {chipPlacements.map((chip) => {
            const { x1, y1, x2, y2 } = signalEndpoints(chip.angleDeg, chip.radiusPct);
            const delay = (chip.index * 0.14) % 3.2;

            return (
              <g key={chip.name}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="cyber-signal-line" />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="cyber-signal-pulse"
                  style={{ animationDelay: `${delay}s` }}
                />
                <circle r="3.5" fill="#a5f3fc" className="cyber-signal-node">
                  <animateMotion
                    dur={`${2.4 + (chip.index % 4) * 0.4}s`}
                    repeatCount="indefinite"
                    path={`M ${x1} ${y1} L ${x2} ${y2}`}
                    begin={`${delay}s`}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        <div
          className="cyber-coin-stage"
          style={{ '--coin-diameter': 'min(243px, 25vw)' } as React.CSSProperties}
        >
          <div className="cyber-coin-spinner">
            <div className="cyber-coin-body">
              <div className="cyber-coin-face cyber-coin-face-front">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <Image
                    src="/brand/entelekron-coin-face.png"
                    alt=""
                    width={512}
                    height={512}
                    className="cyber-coin-logo-mark"
                    priority
                  />
                </div>
              </div>

              <div className="cyber-coin-face cyber-coin-face-back">
                <div className="cyber-coin-shine" />
                <div className="cyber-coin-face-inner">
                  <Image
                    src="/brand/tvk-labs-logo-transparent.png"
                    alt=""
                    width={1024}
                    height={1024}
                    className="cyber-coin-logo-mark cyber-coin-logo-mark-tvk"
                    priority
                  />
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

        <div className="cyber-chip-field absolute inset-0">
          {chipPlacements.map((chip) => {
            const delay = (chip.index * 0.14) % 3.2;

            return (
              <div
                key={chip.name}
                className={cn(
                  'cyber-chip-slot',
                  chip.ringIndex === 0 && 'cyber-chip-slot-inner',
                  chip.ringIndex === 1 && 'cyber-chip-slot-mid',
                  chip.ringIndex === 2 && 'cyber-chip-slot-outer',
                )}
                style={
                  {
                    transform: `rotate(${chip.angleDeg}deg) translateY(-${chip.radiusPct}%)`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="cyber-orbit-chip"
                  style={{ transform: `translate(-50%, -50%) rotate(${-chip.angleDeg}deg)` }}
                >
                  <span className="cyber-orbit-chip-label" style={{ animationDelay: `${delay}s` }}>
                    {chip.name}
                  </span>
                  <span className="cyber-orbit-chip-ping" style={{ animationDelay: `${delay}s` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
