# EnteleWALLET App

<p align="center">
  <img src=".github/assets/entelewallet-logo-horizontal.png" alt="EnteleWALLET — Secure • Intelligent • Connected" width="640" />
</p>

<p align="center">
  <strong>EnteleWALLET Lite</strong> — Secure wallet-connected dashboard for the EnteleKRON ecosystem.
</p>

Repository: [tvk-group/entelewallet-app](https://github.com/tvk-group/entelewallet-app)

> Marketing pages (roadmap, legal, ecosystem) live in the separate **[entelewallet-site](https://github.com/tvk-group/entelewallet-site)** repo at [entelewallet.com](https://entelewallet.com).

## Domains

| Domain | Repo | Purpose |
|--------|------|---------|
| [entelewallet.app](https://entelewallet.app) | **this repo** | PWA wallet app, auth, dashboard |
| [entelewallet.com](https://entelewallet.com) | entelewallet-site | Marketing website |
| app.entelewallet.com | alias → entelewallet.app | Legacy alias (308 redirect) |

See [docs/TWO-REPO-DEPLOYMENT.md](./docs/TWO-REPO-DEPLOYMENT.md) for the full split architecture.

## What It Does

- Auth landing with sign-in, account creation, and wallet connect
- Supabase magic-link authentication (scaffold)
- Connect existing wallets via RainbowKit (MetaMask, WalletConnect, Coinbase, etc.)
- Verify wallet ownership with SIWE (EIP-4361) signatures
- View ENK, ETH, USDT, SOVRA, ENM asset balances
- Access transaction explorer links
- View vesting and claim readiness status
- Official address / transparency integration
- Security center with phishing protection guidance
- 25-language multilingual support

## What It Does NOT Do

- Create or import wallets (seed phrases / private keys)
- Custody funds or execute transfers
- Host marketing content (roadmap, legal, ecosystem pages)

## Setup

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

App-only variables: [`apps/web/.env.example`](./apps/web/.env.example)

Key variables:
- `NEXT_PUBLIC_APP_URL` — canonical app URL (`https://entelewallet.app`)
- `NEXT_PUBLIC_MARKETING_URL` — website URL (`https://entelewallet.com`)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project ID
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — magic-link auth

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |
| `pnpm i18n:check` | Validate all translations |
| `pnpm security:check` | Verify dangerous flags disabled |

## Project Structure

```
apps/web/              Next.js PWA application
packages/config/       Domains, routes, websiteUrl(), feature flags
packages/wallet-core/  SIWE verification (no private keys)
packages/security/     Security copy and constants
packages/blockchain/   Explorer links, ERC-20, multicall
packages/i18n/         25-language translations
packages/ui/           Shared UI components
docs/                  Architecture, security, deployment docs
supabase/              Database migrations
```

## Security

- SIWE signatures verify ownership only — no gas, no transactions
- Dangerous feature flags disabled by default
- Official app domain: `entelewallet.app`
- See [docs/SECURITY_MODEL.md](./docs/SECURITY_MODEL.md)

## License

Proprietary — TVK Group. All rights reserved.
