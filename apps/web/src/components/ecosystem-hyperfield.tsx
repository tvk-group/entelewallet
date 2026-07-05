'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@entelewallet/utils';

interface EcosystemHyperfieldProps {
  nodes: string[];
  className?: string;
}

type Vec4 = [number, number, number, number];

const SCALE = 72;
const VERTICES_4D: Vec4[] = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
]);

const EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    let diff = 0;
    for (let d = 0; d < 4; d++) {
      if (VERTICES_4D[i][d] !== VERTICES_4D[j][d]) diff++;
    }
    if (diff === 1) EDGES.push([i, j]);
  }
}

function rotatePlane(v: Vec4, a: number, i: number, j: number): Vec4 {
  const out: Vec4 = [...v];
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const vi = out[i];
  const vj = out[j];
  out[i] = vi * cos - vj * sin;
  out[j] = vi * sin + vj * cos;
  return out;
}

function rotate4D(v: Vec4, t: number): Vec4 {
  let p = v;
  p = rotatePlane(p, t * 0.7, 0, 3);
  p = rotatePlane(p, t * 0.55, 1, 2);
  p = rotatePlane(p, t * 0.35, 0, 1);
  p = rotatePlane(p, t * 0.25, 2, 3);
  return p;
}

function project4D(v: Vec4, distance: number): [number, number, number] {
  const w = 1 / (distance - v[3]);
  return [v[0] * w, v[1] * w, v[2] * w];
}

function project3DTo2D(x: number, y: number, z: number, fov: number): [number, number] {
  const depth = fov / (fov + z * SCALE * 0.15);
  return [x * SCALE * depth, y * SCALE * depth];
}

const STAR_SEEDS = Array.from({ length: 48 }, (_, i) => ({
  left: `${(i * 17.3) % 100}%`,
  top: `${(i * 23.7) % 100}%`,
  size: 1 + (i % 3),
  delay: `${(i * 0.37) % 5}s`,
  duration: `${3 + (i % 4)}s`,
}));

export function EcosystemHyperfield({ nodes, className }: EcosystemHyperfieldProps) {
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const nodeAngles = useMemo(
    () => nodes.map((_, i) => (360 / nodes.length) * i),
    [nodes],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const frozenT = 1.15;

    const draw = (t: number) => {
      const angle = reducedMotion ? frozenT : t;
      EDGES.forEach(([a, b], idx) => {
        const line = lineRefs.current[idx];
        if (!line) return;

        const pa = project4D(rotate4D(VERTICES_4D[a], angle), 2.8);
        const pb = project4D(rotate4D(VERTICES_4D[b], angle), 2.8);
        const [x1, y1] = project3DTo2D(pa[0], pa[1], pa[2], 3.5);
        const [x2, y2] = project3DTo2D(pb[0], pb[1], pb[2], 3.5);

        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y2));

        const avgZ = (pa[2] + pb[2]) / 2;
        const opacity = 0.25 + Math.max(0, Math.min(0.75, (avgZ + 1.2) / 2.4));
        line.setAttribute('stroke-opacity', String(opacity));
      });
    };

    draw(frozenT);

    if (reducedMotion) return;

    let frame = 0;
    let start: number | null = null;
    const loop = (now: number) => {
      if (start === null) start = now;
      draw((now - start) * 0.001);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        'ecosystem-hyperfield relative mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-[2rem] border border-cyan-500/20',
        className,
      )}
      aria-hidden
    >
      <div className="hyperfield-void absolute inset-0" />
      <div className="hyperfield-nebula absolute inset-0" />
      <div className="hyperfield-grid absolute inset-0 opacity-40" />

      {STAR_SEEDS.map((star, i) => (
        <span
          key={i}
          className="hyperfield-star absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      <div className="hyperfield-stage relative mx-auto aspect-[16/10] w-full min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
        <div className="hyperfield-rings pointer-events-none absolute inset-0">
          <div className="hyperfield-ring hyperfield-ring-a" />
          <div className="hyperfield-ring hyperfield-ring-b" />
          <div className="hyperfield-ring hyperfield-ring-c" />
        </div>

        <svg
          className="hyperfield-tesseract absolute left-1/2 top-1/2 h-[min(88%,520px)] w-[min(88%,520px)] -translate-x-1/2 -translate-y-1/2"
          viewBox="-200 -200 400 400"
          overflow="visible"
        >
          <defs>
            <linearGradient id="hyperfield-edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
            </linearGradient>
            <filter id="hyperfield-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {EDGES.map(([a, b], i) => (
            <line
              key={`${a}-${b}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
              stroke="url(#hyperfield-edge-gradient)"
              strokeWidth="1.25"
              filter="url(#hyperfield-glow)"
              className="hyperfield-edge"
            />
          ))}
        </svg>

        <div className="hyperfield-core-wrap pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="hyperfield-core-halo" />
          <div className="hyperfield-core">
            <span className="relative z-10 text-sm font-bold tracking-[0.2em] text-white sm:text-base">
              ENK
            </span>
          </div>
        </div>

        {nodes.map((node, i) => (
          <div
            key={node}
            className="hyperfield-node absolute left-1/2 top-1/2"
            style={
              {
                '--node-angle': `${nodeAngles[i]}deg`,
                '--node-delay': `${i * 0.35}s`,
              } as React.CSSProperties
            }
          >
            <span className="hyperfield-node-label">{node}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
