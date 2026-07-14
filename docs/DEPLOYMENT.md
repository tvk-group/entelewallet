# Deployment

## Target

- **Primary domain:** entelewallet.app
- **Platform:** Vercel (recommended) or any Node.js host

## Vercel (monorepo)

This repo is a pnpm + Turborepo monorepo. The Next.js app lives in `apps/web`.

### Recommended: Root Directory = `apps/web`

In the Vercel project **Settings → General**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Output Directory** | *(leave blank — Next.js default)* |
| **Install Command** | `cd ../.. && pnpm install` |
| **Build Command** | `cd ../.. && pnpm turbo build --filter=@entelewallet/web` |

`apps/web/vercel.json` encodes install/build commands for this layout.

### Fallback: repo-root deployment

If Root Directory is left at the repository root, the root `vercel.json` sets `framework: nextjs` and `outputDirectory: apps/web/.next` so Vercel does not look for a static `public` build folder.

### Troubleshooting: `No Output Directory named "public"`

This error means Vercel is treating the repo as a static site instead of Next.js. Fix:

1. Set **Root Directory** to `apps/web` (preferred), **or**
2. Ensure root `vercel.json` is present (sets `framework: nextjs`, `outputDirectory: apps/web/.next`)
3. Clear **Output Directory** in Project Settings if it is set to `public`
4. Set **Framework Preset** to **Next.js**

### Troubleshooting: domains redirect loop / site won't load

If `entelewallet.app` never loads (browser says "too many redirects"), check for conflicting apex ↔ www redirects:

| Source | What it does |
|--------|----------------|
| Vercel Domains (dashboard) | May redirect `entelewallet.app` → `www.entelewallet.app` if www is primary |
| `vercel.json` + middleware (this repo) | Redirects `www.entelewallet.app` → `entelewallet.app` |

These fight each other and create an infinite loop.

**Fix in Vercel → Project → Settings → Domains:**

1. Set **`entelewallet.app`** as the **primary** production domain
2. Set **`www.entelewallet.app`** to **redirect** to `entelewallet.app` (not the reverse)
3. Redeploy

Test:

```bash
curl -sI https://entelewallet.app/ | grep -iE '^(HTTP|location:)'
# Expect: HTTP/2 200 (no location header), not a redirect to www
```

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

- app.entelewallet.com → entelewallet.app (also handled in middleware + vercel.json)
- wallet.entelekron.io → entelewallet.app

## Production Checklist

- [ ] WalletConnect Project ID configured
- [ ] Private RPC URLs set
- [ ] Supabase migrations applied
- [ ] SIWE domain matches production domain
- [ ] OG image uploaded to public/og/
- [ ] i18n:check passes
- [ ] security:check passes
- [ ] Build passes
