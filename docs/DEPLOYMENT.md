# Deployment

## Target

- **Canonical application:** https://entelewallet.app
- **Marketing website:** https://entelewallet.com
- **Redirect aliases:** app.entelewallet.com, www.entelewallet.app, wallet.entelekron.io
- **Platform:** Vercel (recommended) or any Node.js host

Domain definitions: `packages/config/src/domains.ts`. See [DOMAINS.md](./DOMAINS.md) for Vercel domain setup.

## Vercel (monorepo)

This repo is a pnpm + Turborepo monorepo. The Next.js app lives in `apps/web`.

In the Vercel project **Settings → General**:

| Setting              | Value                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| **Root Directory**   | `apps/web`                                                             |
| **Framework Preset** | Next.js                                                                |
| **Install Command**  | `cd ../.. && pnpm install` (or leave default if Root Directory is set) |
| **Build Command**    | `cd ../.. && pnpm turbo build --filter=@entelewallet/web`              |

`apps/web/vercel.json` encodes these commands for preview/production deploys.

If Root Directory is left blank (repo root), the build will fail because there is no Next.js app at the repository root.

## Build

```bash
pnpm install
pnpm build
```

## Environment

Copy `.env.example` to `apps/web/.env.local` and configure:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — required for WalletConnect wallets
- `NEXT_PUBLIC_ETHEREUM_RPC_URL` — recommended for production (private RPC)
- Supabase credentials — for production nonce/verification storage

## Redirects

Alias domains redirect to the canonical app at `https://entelewallet.app` (configured in `apps/web/next.config.js` and middleware).

In Vercel Domains, **do not** point `app.entelewallet.com` at `www.entelewallet.app`. Point it at `entelewallet.app` or connect it to Production. See [DOMAINS.md](./DOMAINS.md).

## Production Checklist

- [ ] WalletConnect Project ID configured
- [ ] Private RPC URLs set
- [ ] Supabase migrations applied (including `consume_wallet_nonce` function)
- [ ] Production SIWE nonce storage verified (no memory fallback)
- [ ] SIWE domain matches production domain
- [ ] OG image uploaded to public/og/
- [ ] i18n:check passes
- [ ] security:check passes
- [ ] Build passes
