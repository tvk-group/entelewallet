'use client';

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

const COIN_EDGE_COUNT = 48;
const HUB_W = 1200;
const HUB_H = 360;
const HUB_CX = HUB_W / 2;
const HUB_CY = HUB_H / 2;
const COIN_VIEWBOX_R = 103;
const COIN_CLEARANCE = 28;

type ChipPlacement = {
  name: string;
  x: number;
  y: number;
  index: number;
  tier: 'inner' | 'mid' | 'outer';
};

function layoutChipsOrganically(modules: readonly string[]): ChipPlacement[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const minDist = COIN_VIEWBOX_R + COIN_CLEARANCE;
  const labelPadX = 68;
  const labelPadY = 14;
  const maxRx = HUB_CX - labelPadX;
  const maxRy = HUB_CY - labelPadY;

  return modules.map((name, i) => {
    const angle = i * golden - Math.PI / 2;
    const t = Math.sqrt((i + 0.5) / modules.length);
    const tier: ChipPlacement['tier'] = t < 0.38 ? 'inner' : t < 0.72 ? 'mid' : 'outer';

    const rx = minDist + t * (maxRx - minDist) * 0.98;
    const ry = minDist + t * (maxRy - minDist) * 0.92;

    const jitter = (((i * 17 + 5) % 13) - 6) * 1.4;
    let x = HUB_CX + Math.cos(angle) * rx + Math.cos(angle + 0.9) * jitter;
    let y = HUB_CY + Math.sin(angle) * ry + Math.sin(angle + 0.9) * jitter;

    x = Math.max(labelPadX, Math.min(HUB_W - labelPadX, x));
    y = Math.max(labelPadY, Math.min(HUB_H - labelPadY, y));

    const dx = x - HUB_CX;
    const dy = y - HUB_CY;
    const dist = Math.hypot(dx, dy);
    if (dist < minDist) {
      const scale = minDist / dist;
      x = HUB_CX + dx * scale;
      y = HUB_CY + dy * scale;
    }

    return { name, x, y, index: i, tier };
  });
}

function signalEndpoints(chip: ChipPlacement) {
  const dx = chip.x - HUB_CX;
  const dy = chip.y - HUB_CY;
  const dist = Math.hypot(dx, dy) || 1;
  return {
    x1: HUB_CX + (dx / dist) * COIN_VIEWBOX_R,
    y1: HUB_CY + (dy / dist) * COIN_VIEWBOX_R,
    x2: chip.x,
    y2: chip.y,
  };
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${8 + ((i * 29) % 84)}%`,
  top: `${18 + ((i * 37) % 64)}%`,
  delay: `${(i * 0.41) % 4.5}s`,
  duration: `${4.5 + (i % 3)}s`,
  size: 1 + (i % 2),
}));

export function EcosystemCyberCoin({ className }: EcosystemCyberCoinProps) {
  const chipPlacements = useMemo(() => layoutChipsOrganically(ECOSYSTEM_MODULES), []);

  return (
    <div className={cn('ecosystem-cyber-coin relative mx-auto mt-8 w-full', className)} aria-hidden>
      <div className="cyber-coin-cloud cyber-coin-cloud-a absolute inset-0" />
      <div className="cyber-coin-cloud cyber-coin-cloud-b absolute inset-0" />
      <div className="cyber-coin-cloud cyber-coin-cloud-c absolute inset-0" />
      <div className="cyber-coin-edge-fade absolute inset-0" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="cyber-coin-particle absolute rounded-full bg-cyan-400/80"
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

      <div className="cyber-ecosystem-hub relative z-10 mx-auto h-full w-full">
        <svg
          className="cyber-signal-layer absolute inset-0 h-full w-full"
          viewBox={`0 0 ${HUB_W} ${HUB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <radialGradient id="signal-core-glow" cx="50%" cy="50%" r="38%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
          </defs>

          <ellipse
            cx={HUB_CX}
            cy={HUB_CY}
            rx={COIN_VIEWBOX_R + 12}
            ry={COIN_VIEWBOX_R + 8}
            fill="url(#signal-core-glow)"
          />

          {chipPlacements.map((chip) => {
            const { x1, y1, x2, y2 } = signalEndpoints(chip);
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
                <circle r="2.5" fill="#67e8f9" className="cyber-signal-node">
                  <animateMotion
                    dur={`${2.6 + (chip.index % 4) * 0.4}s`}
                    repeatCount="indefinite"
                    path={`M ${x1} ${y1} L ${x2} ${y2}`}
                    begin={`${delay}s`}
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        <div className="cyber-coin-stage">
          <div className="cyber-coin-tilt">
            <div className="cyber-coin-spinner">
              <div className="cyber-coin-body">
                <div className="cyber-coin-face cyber-coin-face-front" aria-hidden>
                  <div className="cyber-coin-shine" />
                  <div className="cyber-coin-face-plate" />
                  <div className="cyber-coin-face-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/brand/entelekron-coin-face.png"
                      alt=""
                      className="cyber-coin-logo-mark cyber-coin-logo-enk"
                      draggable={false}
                      loading="eager"
                      decoding="sync"
                    />
                  </div>
                </div>

                <div className="cyber-coin-face cyber-coin-face-back" aria-hidden>
                  <div className="cyber-coin-shine cyber-coin-shine-back" />
                  <div className="cyber-coin-face-inner cyber-coin-face-inner-tvk">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/brand/tvk-labs-logo-original-512.png"
                      alt=""
                      className="cyber-coin-logo-mark cyber-coin-logo-tvk"
                      draggable={false}
                      loading="eager"
                      decoding="sync"
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
                  chip.tier === 'inner' && 'cyber-chip-slot-inner',
                  chip.tier === 'mid' && 'cyber-chip-slot-mid',
                  chip.tier === 'outer' && 'cyber-chip-slot-outer',
                )}
                style={{
                  left: `${(chip.x / HUB_W) * 100}%`,
                  top: `${(chip.y / HUB_H) * 100}%`,
                }}
              >
                <div className="cyber-orbit-chip">
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
