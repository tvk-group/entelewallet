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

const ORBIT_RINGS = [
  { radius: 0.56, offsetDeg: 0 },
  { radius: 0.64, offsetDeg: 12 },
  { radius: 0.72, offsetDeg: -8 },
] as const;

type OrbitNode = {
  name: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  ring: number;
  delay: number;
};

function distributeModules(modules: readonly string[]): OrbitNode[] {
  const perRing = Math.ceil(modules.length / ORBIT_RINGS.length);
  const nodes: OrbitNode[] = [];

  modules.forEach((name, index) => {
    const ringIndex = Math.min(Math.floor(index / perRing), ORBIT_RINGS.length - 1);
    const indexInRing = index - ringIndex * perRing;
    const countInRing = Math.min(perRing, modules.length - ringIndex * perRing);
    const ring = ORBIT_RINGS[ringIndex];
    const angleDeg = ring.offsetDeg + (360 / countInRing) * indexInRing;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = ring.radius * (HUB_SIZE / 2);
    const x = HUB_CENTER + Math.cos(angleRad) * r;
    const y = HUB_CENTER + Math.sin(angleRad) * r;

    nodes.push({
      name,
      x,
      y,
      angle: angleDeg,
      radius: ring.radius,
      ring: ringIndex,
      delay: (index * 0.17) % 4,
    });
  });

  return nodes;
}

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${6 + ((i * 31) % 88)}%`,
  top: `${8 + ((i * 47) % 84)}%`,
  delay: `${(i * 0.33) % 5}s`,
  duration: `${3.5 + (i % 4)}s`,
  size: 1 + (i % 3),
}));

export function EcosystemCyberCoin({ className }: EcosystemCyberCoinProps) {
  const nodes = useMemo(() => distributeModules(ECOSYSTEM_MODULES), []);

  return (
    <div
      className={cn(
        'ecosystem-cyber-coin relative mx-auto mt-10 w-full max-w-[690px] overflow-hidden rounded-[2rem]',
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

      <div className="cyber-ecosystem-hub relative z-10 mx-auto aspect-square w-full max-w-[690px]">
        <svg
          className="cyber-signal-layer absolute inset-0 h-full w-full"
          viewBox={`0 0 ${HUB_SIZE} ${HUB_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="signal-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
            <linearGradient id="signal-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.05)" />
              <stop offset="45%" stopColor="rgba(34,211,238,0.45)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0.65)" />
            </linearGradient>
          </defs>

          <circle cx={HUB_CENTER} cy={HUB_CENTER} r="200" fill="url(#signal-core-glow)" />

          {ORBIT_RINGS.map((ring, i) => (
            <ellipse
              key={i}
              cx={HUB_CENTER}
              cy={HUB_CENTER}
              rx={ring.radius * (HUB_SIZE / 2)}
              ry={ring.radius * (HUB_SIZE / 2) * 0.92}
              className="cyber-orbit-track"
              style={{ animationDelay: `${i * 0.8}s` }}
            />
          ))}

          {nodes.map((node, i) => (
            <g key={node.name}>
              <line
                x1={HUB_CENTER}
                y1={HUB_CENTER}
                x2={node.x}
                y2={node.y}
                className="cyber-signal-line"
                style={{ animationDelay: `${node.delay}s` }}
              />
              <line
                x1={HUB_CENTER}
                y1={HUB_CENTER}
                x2={node.x}
                y2={node.y}
                className="cyber-signal-pulse"
                style={{ animationDelay: `${node.delay + 0.4}s` }}
              />
              <circle r="3" fill="#67e8f9" className="cyber-signal-node">
                <animateMotion
                  dur={`${2.8 + (i % 3) * 0.6}s`}
                  repeatCount="indefinite"
                  path={`M ${HUB_CENTER} ${HUB_CENTER} L ${node.x} ${node.y}`}
                  begin={`${node.delay}s`}
                />
              </circle>
            </g>
          ))}
        </svg>

        <div
          className="cyber-coin-stage"
          style={
            {
              '--coin-diameter': 'min(360px, 52vw)',
            } as React.CSSProperties
          }
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

        {nodes.map((node) => (
          <div
            key={node.name}
            className="cyber-orbit-chip"
            style={
              {
                left: `${(node.x / HUB_SIZE) * 100}%`,
                top: `${(node.y / HUB_SIZE) * 100}%`,
                '--chip-delay': `${node.delay}s`,
                '--chip-angle': `${node.angle}deg`,
              } as React.CSSProperties
            }
          >
            <span className="cyber-orbit-chip-label">{node.name}</span>
            <span className="cyber-orbit-chip-ping" />
          </div>
        ))}
      </div>
    </div>
  );
}
