# EnteleWALLET

<p align="center">
  <img src=".github/assets/entelewallet-logo-horizontal.png" alt="EnteleWALLET — Secure • Intelligent • Connected" width="640" />
</p>

<p align="center">
  <strong>EnteleWALLET Lite</strong> — Secure wallet-connected dashboard for the EnteleKRON ecosystem.
</p>

Repository: [tvk-group/entelewallet-app](https://github.com/tvk-group/entelewallet-app)

## Brand Assets

Official logos and banners live in:

| Asset                | Path                                               |
| -------------------- | -------------------------------------------------- |
| Full logo (white bg) | `.github/assets/entelewallet-logo-horizontal.png`  |
| Icon mark (white bg) | `.github/assets/entelewallet-icon-512.png`         |
| Dark banner          | `.github/assets/entelewallet-logo-horizontal.png`  |
| Social preview / OG  | `.github/assets/social-preview.png`                |
| Website copies       | `apps/web/public/brand/` and `apps/web/public/og/` |

Tagline: **SECURE • INTELLIGENT • CONNECTED**

## Current Phase

**EnteleWALLET Lite** — Phase 1 production release with fortress security foundation (Phase 0).

Connect, verify and monitor your EnteleKRON ecosystem wallet. Read-only, non-custodial, no seed phrases or private keys.

## What It Does

- Connect existing wallets via RainbowKit modal (MetaMask, WalletConnect, Coinbase, etc.)
- Verify wallet ownership with SIWE (EIP-4361) signatures
- View ENK, ETH, USDT, SOVRA, ENM asset balances
- Access transaction explorer links
- View vesting and claim readiness status
- Official address / transparency integration
- Security center with phishing protection guidance
- 25-language multilingual support

## What It Does NOT Do

- Create or import wallets
- Store seed phrases or private keys
- Custody funds
- Send tokens, swap, stake, or trade
- Browser extension or mobile key storage

> **Warning:** This repository must never add seed phrase, private key, custody, transfer, swap or exchange functionality without formal security architecture, independent audit planning and legal approval.

## Domains

Canonical domain definitions live in `packages/config/src/domains.ts`.

| Domain                                               | Purpose                           |
| ---------------------------------------------------- | --------------------------------- |
| [entelewallet.app](https://entelewallet.app)         | Canonical application (this repo) |
| [entelewallet.com](https://entelewallet.com)         | Marketing website                 |
| [app.entelewallet.com](https://app.entelewallet.com) | Redirect alias → entelewallet.app |
| [www.entelewallet.app](https://www.entelewallet.app) | Redirect alias → entelewallet.app |
| [wallet.entelekron.io](https://wallet.entelekron.io) | Redirect alias → entelewallet.app |

## Setup

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) and `.env.example`.

Copy `apps/web/.env.example` to `apps/web/.env.local` and configure:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project ID (required for mobile/QR wallets)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required for email magic-link sign-in and production SIWE nonce storage
- `NEXT_PUBLIC_ETHEREUM_RPC_URL` — Ethereum RPC (optional)

**Vercel:** Add the same variables in Project → Settings → Environment Variables. Without Supabase keys, wallet connect still works in development; production requires Supabase for SIWE nonce storage.

## Scripts

| Script                | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `pnpm dev`            | Start development server                                   |
| `pnpm build`          | Production build                                           |
| `pnpm lint`           | ESLint                                                     |
| `pnpm typecheck`      | TypeScript check                                           |
| `pnpm test`           | Unit and integration tests (Vitest)                        |
| `pnpm test:e2e`       | Playwright smoke tests                                     |
| `pnpm i18n:check`     | Validate all translations                                  |
| `pnpm security:check` | Verify dangerous flags disabled and release gates enforced |
| `pnpm format`         | Prettier format                                            |

## Project Structure

```
apps/web/           Next.js application
packages/config/    Feature flags, tokens, chains, domains
packages/wallet-core/  SIWE verification (no private keys)
packages/security/  Security copy and constants
packages/blockchain/  Explorer links, ERC-20, multicall
packages/i18n/      25-language translations
packages/ui/        Shared UI components
docs/               Architecture, security, deployment docs
supabase/           Database migrations
```

## Security

- SIWE signatures verify ownership only — no gas, no transactions
- Dangerous feature flags disabled by default and not env-overridable
- Production SIWE requires persistent Supabase nonce storage (fail closed)
- Security headers and CSP report-only monitoring
- Official domain list: entelewallet.app, entelewallet.com, entelekron.io, tvk.group
- See [docs/SECURITY_MODEL.md](./docs/SECURITY_MODEL.md), [docs/THREAT_MODEL.md](./docs/THREAT_MODEL.md), [docs/SECURITY_RELEASE_GATES.md](./docs/SECURITY_RELEASE_GATES.md)

## Roadmap

See [docs/PHASES.md](./docs/PHASES.md).

- **Now:** Lite — connect, verify, monitor
- **Next:** Account layer, investor linking, vesting integration
- **Future:** Full non-custodial wallet (requires audit + legal review)

## License

Proprietary — TVK Group. All rights reserved.
