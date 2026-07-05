#!/usr/bin/env node
/**
 * Builds a portable ecosystem cyber-coin animation bundle for:
 * - iframe embed on entelekron.io / entelekron.org / tvk.group
 * - screen recording for advertising (reklama)
 * - copying into other site repos
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const webPublic = path.join(root, 'apps/web/public');
const outDir = path.join(webPublic, 'ecosystem-animation');
const brandSrc = path.join(webPublic, 'brand');
const brandOut = path.join(outDir, 'brand');
const globalsCss = fs.readFileSync(path.join(root, 'apps/web/src/app/globals.css'), 'utf8');
const ecosystemTs = fs.readFileSync(path.join(root, 'packages/config/src/ecosystem.ts'), 'utf8');

const labelMatches = [...ecosystemTs.matchAll(/label:\s*'([^']+)'/g)];
const modules = labelMatches.map((m) => m[1]);

if (modules.length !== 28) {
  console.error(`Expected 28 ecosystem modules, found ${modules.length}`);
  process.exit(1);
}

function extractCssBlock(source, startMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Could not find CSS start marker: ${startMarker}`);
  }
  const endMarker = '@keyframes cyberChipPing';
  const end = source.indexOf(endMarker, start);
  if (end === -1) {
    throw new Error('Could not find @keyframes cyberChipPing');
  }
  const closing = source.indexOf('}', end);
  return source.slice(start, closing + 1).trim();
}

const animationCss = extractCssBlock(
  globalsCss,
  '/* Ecosystem cyber coin — borderless, blends into homepage */',
);

const reducedMotionCss = `
@media (prefers-reduced-motion: reduce) {
  .cyber-coin-spinner,
  .cyber-coin-shine,
  .cyber-coin-halo,
  .cyber-coin-particle,
  .cyber-signal-pulse,
  .cyber-orbit-chip-label,
  .cyber-orbit-chip-ping,
  .cyber-coin-cloud {
    animation: none !important;
  }
}
`;

const css = `${animationCss}\n\n${reducedMotionCss}`;

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(brandOut, { recursive: true });

fs.writeFileSync(path.join(outDir, 'ecosystem-cyber-coin.css'), css);

for (const file of ['entelekron-coin-face.png', 'tvk-labs-logo-original-512.png']) {
  fs.copyFileSync(path.join(brandSrc, file), path.join(brandOut, file));
}

const embedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EnteleKRON Ecosystem Animation</title>
  <link rel="stylesheet" href="./ecosystem-cyber-coin.css" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 45%, #f1f5f9 100%);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem 3rem;
    }
    h1 {
      text-align: center;
      font-size: clamp(1.25rem, 2.5vw, 1.75rem);
      color: #0f172a;
      margin: 0 0 0.5rem;
    }
    p.lead {
      text-align: center;
      color: #475569;
      margin: 0 0 1.5rem;
      font-size: 0.95rem;
    }
    .embed-frame {
      border-radius: 1rem;
      overflow: visible;
    }
    .footer-note {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.8rem;
      color: #64748b;
    }
    .footer-note a { color: #0284c7; }
  </style>
</head>
<body>
  <div class="page">
    <h1>EnteleKRON Ecosystem Layer</h1>
    <p class="lead">28 official ecosystem modules · EnteleKRON / TVK Group</p>
    <div id="root" class="embed-frame"></div>
    <p class="footer-note">
      Portable animation bundle for entelekron.io · entelekron.org · tvk.group ·
      <a href="https://entelewallet.app">entelewallet.app</a>
    </p>
  </div>
  <script>
    const MODULES = ${JSON.stringify(modules, null, 2)};
    const COIN_EDGE_COUNT = 48;
    const HUB_W = 1200;
    const HUB_H = 360;
    const HUB_CX = HUB_W / 2;
    const HUB_CY = HUB_H / 2;
    const COIN_VIEWBOX_R = 103;
    const COIN_CLEARANCE = 28;

    function layoutChipsOrganically(modules) {
      const golden = Math.PI * (3 - Math.sqrt(5));
      const minDist = COIN_VIEWBOX_R + COIN_CLEARANCE;
      const labelPadX = 68;
      const labelPadY = 14;
      const maxRx = HUB_CX - labelPadX;
      const maxRy = HUB_CY - labelPadY;

      return modules.map((name, i) => {
        const angle = i * golden - Math.PI / 2;
        const t = Math.sqrt((i + 0.5) / modules.length);
        const tier = t < 0.38 ? 'inner' : t < 0.72 ? 'mid' : 'outer';
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

    function signalEndpoints(chip) {
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

    const chips = layoutChipsOrganically(MODULES);
    const root = document.getElementById('root');

    const particles = Array.from({ length: 12 }, (_, i) =>
      \`<span class="cyber-coin-particle absolute rounded-full bg-cyan-400/80" style="left:\${8 + ((i * 29) % 84)}%;top:\${18 + ((i * 37) % 64)}%;width:\${1 + (i % 2)}px;height:\${1 + (i % 2)}px;animation-delay:\${(i * 0.41) % 4.5}s;animation-duration:\${4.5 + (i % 3)}s"></span>\`
    ).join('');

    const signalLines = chips.map((chip) => {
      const { x1, y1, x2, y2 } = signalEndpoints(chip);
      const delay = (chip.index * 0.14) % 3.2;
      return \`<g>
        <line x1="\${x1}" y1="\${y1}" x2="\${x2}" y2="\${y2}" class="cyber-signal-line" />
        <line x1="\${x1}" y1="\${y1}" x2="\${x2}" y2="\${y2}" class="cyber-signal-pulse" style="animation-delay:\${delay}s" />
        <circle r="2.5" fill="#67e8f9" class="cyber-signal-node">
          <animateMotion dur="\${2.6 + (chip.index % 4) * 0.4}s" repeatCount="indefinite" path="M \${x1} \${y1} L \${x2} \${y2}" begin="\${delay}s" />
        </circle>
      </g>\`;
    }).join('');

    const chipNodes = chips.map((chip) => {
      const delay = (chip.index * 0.14) % 3.2;
      return \`<div class="cyber-chip-slot cyber-chip-slot-\${chip.tier}" style="left:\${(chip.x / HUB_W) * 100}%;top:\${(chip.y / HUB_H) * 100}%">
        <div class="cyber-orbit-chip">
          <span class="cyber-orbit-chip-label" style="animation-delay:\${delay}s">\${chip.name}</span>
          <span class="cyber-orbit-chip-ping" style="animation-delay:\${delay}s"></span>
        </div>
      </div>\`;
    }).join('');

    const edges = Array.from({ length: COIN_EDGE_COUNT }, (_, i) =>
      \`<div class="cyber-coin-edge" style="--edge-angle:\${(360 / COIN_EDGE_COUNT) * i}deg"></div>\`
    ).join('');

    root.innerHTML = \`
      <div class="ecosystem-cyber-coin relative mx-auto mt-8 w-full" aria-hidden="true">
        <div class="cyber-coin-cloud cyber-coin-cloud-a absolute inset-0"></div>
        <div class="cyber-coin-cloud cyber-coin-cloud-b absolute inset-0"></div>
        <div class="cyber-coin-cloud cyber-coin-cloud-c absolute inset-0"></div>
        <div class="cyber-coin-edge-fade absolute inset-0"></div>
        \${particles}
        <div class="cyber-ecosystem-hub relative z-10 mx-auto h-full w-full">
          <svg class="cyber-signal-layer absolute inset-0 h-full w-full" viewBox="0 0 \${HUB_W} \${HUB_H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="signal-core-glow" cx="50%" cy="50%" r="38%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.28)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </radialGradient>
            </defs>
            <ellipse cx="\${HUB_CX}" cy="\${HUB_CY}" rx="\${COIN_VIEWBOX_R + 12}" ry="\${COIN_VIEWBOX_R + 8}" fill="url(#signal-core-glow)" />
            \${signalLines}
          </svg>
          <div class="cyber-coin-stage">
            <div class="cyber-coin-tilt">
              <div class="cyber-coin-spinner">
                <div class="cyber-coin-body">
                  <div class="cyber-coin-face cyber-coin-face-front">
                    <div class="cyber-coin-shine"></div>
                    <div class="cyber-coin-face-plate"></div>
                    <div class="cyber-coin-face-inner">
                      <img src="./brand/entelekron-coin-face.png" alt="" class="cyber-coin-logo-mark cyber-coin-logo-enk" draggable="false" />
                    </div>
                  </div>
                  <div class="cyber-coin-face cyber-coin-face-back">
                    <div class="cyber-coin-shine cyber-coin-shine-back"></div>
                    <div class="cyber-coin-face-inner cyber-coin-face-inner-tvk">
                      <img src="./brand/tvk-labs-logo-original-512.png" alt="" class="cyber-coin-logo-mark cyber-coin-logo-tvk" draggable="false" />
                    </div>
                  </div>
                  \${edges}
                </div>
              </div>
            </div>
            <div class="cyber-coin-halo"></div>
            <div class="cyber-coin-reflection"></div>
          </div>
          <div class="cyber-chip-field absolute inset-0">\${chipNodes}</div>
        </div>
      </div>\`;
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'embed.html'), embedHtml);

const readme = `# Ecosystem Cyber-Coin Animation Bundle

Portable export of the EnteleKRON ecosystem layer animation for cloning and advertising.

## Files

| File | Purpose |
|------|---------|
| \`embed.html\` | Standalone demo page — open locally or host anywhere |
| \`ecosystem-cyber-coin.css\` | All animation styles |
| \`brand/\` | Official EnteleKRON and TVK Labs coin logos |

## Clone to other sites

### Option A — iframe embed (fastest)

Host this folder on any domain, or use the live copy:

\`\`\`html
<iframe
  src="https://entelewallet.app/ecosystem-animation/embed.html"
  title="EnteleKRON Ecosystem"
  width="100%"
  height="360"
  style="border:0;max-width:1200px;display:block;margin:0 auto;"
  loading="lazy"
></iframe>
\`\`\`

Deploy the same \`ecosystem-animation/\` folder to:

- https://entelekron.io/ecosystem-animation/
- https://entelekron.org/ecosystem-animation/
- https://tvk.group/ecosystem-animation/

### Option B — React component (full integration)

Copy from the EnteleWALLET monorepo:

1. \`apps/web/src/components/ecosystem-cyber-coin.tsx\`
2. \`apps/web/src/app/globals.css\` (ecosystem-cyber-coin section)
3. \`apps/web/public/brand/entelekron-coin-face.png\`
4. \`apps/web/public/brand/tvk-labs-logo-original-512.png\`
5. \`packages/config/src/ecosystem.ts\` (28 official project names)

Import \`<EcosystemCyberCoin />\` in your homepage ecosystem section.

### Option C — Copy this bundle

Copy the entire \`ecosystem-animation/\` directory into your site's \`public/\` folder.

Regenerate after updates:

\`\`\`bash
pnpm ecosystem:export
\`\`\`

## Advertising / reklama export

CSS 3D animations cannot be saved as a single video file directly. Use one of these:

1. **Screen record** — Open \`embed.html\` fullscreen at 1920×1080, record 15–30s loop (OBS, QuickTime, ShareX).
2. **Browser capture** — Chrome DevTools → Rendering → capture screenshot series, or use Puppeteer/Playwright to export WebM.
3. **Iframe in ad creative** — Some HTML5 ad platforms accept iframe/HTML embeds; use \`embed.html\`.
4. **Assets for video editors** — Export PNG logos from \`brand/\`, use screen recording as background layer in Premiere/DaVinci/CapCut.

Live demo URL for recording: https://entelewallet.app/ecosystem-animation/embed.html

## Official 28 ecosystem modules

${modules.map((m, i) => `${i + 1}. ${m}`).join('\n')}
`;

fs.writeFileSync(path.join(outDir, 'README.md'), readme);

console.log(`Built ecosystem animation export → ${outDir}`);
console.log(`  ${modules.length} modules, CSS + embed.html + brand assets`);
