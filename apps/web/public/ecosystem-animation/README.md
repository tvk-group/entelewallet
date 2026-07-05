# Ecosystem Cyber-Coin Animation Bundle

Portable export of the EnteleKRON ecosystem layer animation for cloning and advertising.

## Files

| File | Purpose |
|------|---------|
| `embed.html` | Standalone demo page — open locally or host anywhere |
| `ecosystem-cyber-coin.css` | All animation styles |
| `brand/` | Official EnteleKRON and TVK Labs coin logos |

## Clone to other sites

### Option A — iframe embed (fastest)

Host this folder on any domain, or use the live copy:

```html
<iframe
  src="https://entelewallet.app/ecosystem-animation/embed.html"
  title="EnteleKRON Ecosystem"
  width="100%"
  height="360"
  style="border:0;max-width:1200px;display:block;margin:0 auto;"
  loading="lazy"
></iframe>
```

Deploy the same `ecosystem-animation/` folder to:

- https://entelekron.io/ecosystem-animation/
- https://entelekron.org/ecosystem-animation/
- https://tvk.group/ecosystem-animation/

### Option B — React component (full integration)

Copy from the EnteleWALLET monorepo:

1. `apps/web/src/components/ecosystem-cyber-coin.tsx`
2. `apps/web/src/app/globals.css` (ecosystem-cyber-coin section)
3. `apps/web/public/brand/entelekron-coin-face.png`
4. `apps/web/public/brand/tvk-labs-logo-original-512.png`
5. `packages/config/src/ecosystem.ts` (28 official project names)

Import `<EcosystemCyberCoin />` in your homepage ecosystem section.

### Option C — Copy this bundle

Copy the entire `ecosystem-animation/` directory into your site's `public/` folder.

Regenerate after updates:

```bash
pnpm ecosystem:export
```

## Advertising / reklama export

CSS 3D animations cannot be saved as a single video file directly. Use one of these:

1. **Screen record** — Open `embed.html` fullscreen at 1920×1080, record 15–30s loop (OBS, QuickTime, ShareX).
2. **Browser capture** — Chrome DevTools → Rendering → capture screenshot series, or use Puppeteer/Playwright to export WebM.
3. **Iframe in ad creative** — Some HTML5 ad platforms accept iframe/HTML embeds; use `embed.html`.
4. **Assets for video editors** — Export PNG logos from `brand/`, use screen recording as background layer in Premiere/DaVinci/CapCut.

Live demo URL for recording: https://entelewallet.app/ecosystem-animation/embed.html

## Official 28 ecosystem modules

1. ENK
2. SOVRA AI
3. EnergieMIND
4. ENM
5. EnteleWALLET
6. EnteleSCAN
7. EnteleLINK
8. EnteleLEDGER
9. EnteleCLOS
10. EnteleVAULT
11. TVK ID
12. GraphVault
13. ChronoSeal
14. Q-Presence
15. Cerebthra
16. Cognethra
17. SYNTHERRA
18. Sentient Signals
19. TVK CyberLab
20. TVK Labs
21. TVK Group Türkiye
22. TVK Wallet
23. TVK Group
24. ALVINA
25. Ava Sentient
26. Ava Santé
27. PuppyKRON
28. KRON Assets
