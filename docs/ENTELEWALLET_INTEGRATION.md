# EnteleWALLET ↔ EnteleKRON Integration

Cross-app embed contract for opening **entelewallet.app** from the EnteleKRON investor dashboard (presale PWA).

## URL parameters

| Parameter | Value | Behavior |
|-----------|-------|----------|
| `source` | `entelekron` | Shows **“Opened from EnteleKRON”** banner with optional return link |
| `view` | `wallet` | Skips marketing landing; opens wallet UI in phone frame |
| `view` | `security` | Opens compact security settings view |
| `view` | `transparency` | Opens compact transparency / official addresses view |

Parameters can be combined:

```
https://entelewallet.app/?source=entelekron&view=wallet
```

## Routing examples

| URL | Result |
|-----|--------|
| `/` | Standard marketing landing |
| `/?view=wallet` | Wallet app screen (connect, networks, balances) |
| `/?view=security` | Security settings summary |
| `/?view=transparency` | Transparency / official addresses |
| `/?source=entelekron` | Landing + “Opened from EnteleKRON” banner |
| `/?source=entelekron&view=wallet` | Wallet embed + return banner |

## Return path

When `source=entelekron`, the banner includes **“Back to EnteleKRON”** linking to:

```
https://www.entelekron.io/presale/en/dashboard/investor
```

Override via environment variable:

```bash
NEXT_PUBLIC_ENTELEKRON_INVESTOR_RETURN_URL=https://www.entelekron.io/presale/en/dashboard/investor
```

Config constant: `DOMAIN_CONFIG.entelekronInvestorDashboard` in `@entelewallet/config`.

## Visual design (dashboard embed)

Embed views use EnteleKRON dashboard colors:

| Token | Hex | Usage |
|-------|-----|-------|
| Void | `#1e2f48` | Phone frame background, embed page backdrop |
| Accent | `#14b8a6` | Highlights, links, status dot |

The phone/wallet frame matches the dashboard embed mockup: rounded bezel, status bar notch, EnteleWALLET header, scrollable screen.

## EnteleKRON dashboard iframe (entelekron-token)

Recommended iframe `src` for the investor dashboard wallet panel:

```html
<iframe
  src="https://entelewallet.app/?source=entelekron&view=wallet"
  title="EnteleWALLET"
  allow="clipboard-write"
  style="width:100%;min-height:720px;border:0;border-radius:1rem;"
/>
```

Other views:

- Security: `https://entelewallet.app/?source=entelekron&view=security`
- Transparency: `https://entelewallet.app/?source=entelekron&view=transparency`

## Implementation map (entelewallet repo)

| File | Role |
|------|------|
| `packages/config/src/integration.ts` | Source/view constants, embed brand colors |
| `apps/web/src/lib/use-embed-routing.ts` | Reads `?source` and `?view` from URL |
| `apps/web/src/components/integration/embed-app-shell.tsx` | Embed layout orchestrator |
| `apps/web/src/components/integration/wallet-phone-frame.tsx` | Phone bezel UI |
| `apps/web/src/components/integration/embed-*-view.tsx` | Per-view content |
| `apps/web/src/app/home-page-content.tsx` | Marketing vs embed routing on `/` |

## WalletConnect allowlist

Ensure these origins stay allowlisted in Reown / WalletConnect Cloud:

- `https://entelewallet.app`
- `https://app.entelewallet.com`
- `https://www.entelekron.io` (parent frame, if connecting from iframe)

## Phase 1 scope

- Connect wallet (RainbowKit / WalletConnect)
- Network picker (all display networks)
- Balances (live when connected; placeholder rows when disconnected)
- Read-only security and transparency summaries with links to full pages

Future: deep-link verified wallet state back to EnteleKRON dashboard after SIWE verification.
