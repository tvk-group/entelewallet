# Ecosystem Cyber-Coin Animation

Portable ecosystem layer animation with 3D EnteleKRON / TVK Labs coin and 28 orbiting module chips.

## Quick links

| Use case                    | URL / path                                              |
| --------------------------- | ------------------------------------------------------- |
| Live standalone demo        | https://entelewallet.app/ecosystem-animation/embed.html |
| Export bundle (copy/deploy) | `apps/web/public/ecosystem-animation/`                  |
| React component             | `apps/web/src/components/ecosystem-cyber-coin.tsx`      |
| Official 28 projects config | `packages/config/src/ecosystem.ts`                      |

Regenerate the portable bundle after changes:

```bash
pnpm ecosystem:export
```

## Clone to EnteleKRON.org, EnteleKRON.io, and TVK.group

These domains are separate deployments. This repo ships everything needed to copy the animation.

### Fastest: iframe embed

Add to the ecosystem section on each site:

```html
<iframe
  src="https://entelewallet.app/ecosystem-animation/embed.html"
  title="EnteleKRON Ecosystem — 28 modules"
  width="100%"
  height="360"
  style="border:0;max-width:1200px;display:block;margin:0 auto;"
  loading="lazy"
></iframe>
```

For self-hosted copies, deploy the `ecosystem-animation/` folder to each domain:

- `https://entelekron.io/ecosystem-animation/embed.html`
- `https://entelekron.org/ecosystem-animation/embed.html`
- `https://tvk.group/ecosystem-animation/embed.html`

### Full integration (React / Next.js)

1. Copy `ecosystem-cyber-coin.tsx` and the CSS block from `globals.css` (search for `Ecosystem cyber coin`).
2. Copy brand assets from `apps/web/public/brand/`.
3. Copy or import `ECOSYSTEM_PROJECTS` from `packages/config/src/ecosystem.ts`.
4. Render `<EcosystemCyberCoin />` in the homepage ecosystem section.

## Official 28 ecosystem projects

Single source of truth: `packages/config/src/ecosystem.ts`

| #   | Chip label        | Full name               |
| --- | ----------------- | ----------------------- |
| 1   | ENK               | ENK                     |
| 2   | SOVRA AI          | SOVRA AI                |
| 3   | EnergieMIND       | EnergieMIND             |
| 4   | ENM               | ENM                     |
| 5   | EnteleWALLET      | EnteleWALLET            |
| 6   | EnteleSCAN        | EnteleSCAN              |
| 7   | EnteleLINK        | EnteleLINK              |
| 8   | EnteleLEDGER      | EnteleLEDGER            |
| 9   | EnteleCLOS        | EnteleCLOS              |
| 10  | EnteleVAULT       | EnteleVAULT             |
| 11  | TVK ID            | TVK ID                  |
| 12  | GraphVault        | GraphVault              |
| 13  | ChronoSeal        | ChronoSeal              |
| 14  | Q-Presence        | Q-Presence              |
| 15  | Cerebthra         | Cerebthra               |
| 16  | Cognethra         | Cognethra               |
| 17  | SYNTHERRA         | SYNTHERRA               |
| 18  | Sentient Signals  | Sentient Signals        |
| 19  | TVK CyberLab      | TVK CyberLab            |
| 20  | TVK Labs          | TVK Labs & Technologies |
| 21  | TVK Group Türkiye | TVK Group Türkiye       |
| 22  | TVK Wallet        | TVK Wallet              |
| 23  | TVK Group         | TVK Group               |
| 24  | ALVINA            | ALVINA                  |
| 25  | Ava Sentient      | Ava Sentient            |
| 26  | Ava Santé         | Ava Santé               |
| 27  | PuppyKRON         | PuppyKRON               |
| 28  | KRON Assets       | KRON Ecosystem Assets   |

Replaced outdated chip names from earlier drafts (e.g. `GraphVAULT`, `Ava Sante`, experimental `*KRON` token variants not listed on official sites).

## Download / copy for advertising (reklama)

The animation is **CSS + HTML**, not a video file. To use it in ads:

1. **Screen recording (recommended)** — Open `embed.html` at 1920×1080, record a 15–30 second loop with OBS, QuickTime, or ShareX. Export MP4 for social/video ads.
2. **Self-hosted HTML5 ad** — Upload the `ecosystem-animation/` folder to your ad CDN; some platforms accept HTML5 iframe creatives.
3. **Video editor** — Import the screen recording as a background layer; overlay logos from `brand/` and copy from your campaign brief.
4. **Playwright capture** — Run `pnpm ecosystem:export` then use headless Chrome to capture WebM (see `scripts/build-ecosystem-animation-export.mjs` output path).

**Live URL for recording:** https://entelewallet.app/ecosystem-animation/embed.html

**Download bundle:** copy `apps/web/public/ecosystem-animation/` from this repo (or after deploy, zip from the live `/ecosystem-animation/` path).
