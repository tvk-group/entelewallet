# Deployment

## Target

- **Primary domain:** app.entelewallet.com
- **Platform:** Vercel (recommended) or any Node.js host

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

Configure at DNS/CDN level:

- entelewallet.app → app.entelewallet.com
- wallet.entelekron.io → app.entelewallet.com

## Production Checklist

- [ ] WalletConnect Project ID configured
- [ ] Private RPC URLs set
- [ ] Supabase migrations applied
- [ ] SIWE domain matches production domain
- [ ] OG image uploaded to public/og/
- [ ] i18n:check passes
- [ ] security:check passes
- [ ] Build passes
