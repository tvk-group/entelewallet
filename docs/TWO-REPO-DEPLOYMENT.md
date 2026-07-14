# Two-Repo Deployment: App vs Marketing Site

EnteleWALLET is split across two repositories:

| Repository | Domain | Purpose |
|------------|--------|---------|
| **tvk-group/entelewallet-app** (this repo) | [entelewallet.app](https://entelewallet.app) | PWA wallet dashboard, auth, connect, portfolio |
| **tvk-group/entelewallet-site** | [entelewallet.com](https://entelewallet.com) | Marketing, roadmap, legal, ecosystem content |

## Canonical domains

- **App (canonical):** `entelewallet.app`
- **Marketing (canonical):** `entelewallet.com`

### Alias redirects (308 → entelewallet.app)

Configured in `apps/web/src/middleware.ts` and `apps/web/vercel.json`:

- `www.entelewallet.app`
- `app.entelewallet.com`
- `www.app.entelewallet.com`

## Route ownership

### Served by entelewallet-app (entelewallet.app)

| Path | Description |
|------|-------------|
| `/` | Auth landing (sign in, create account, connect wallet) |
| `/sign-in` | Supabase magic-link sign-in |
| `/auth/callback` | Supabase auth callback |
| `/connect` | Wallet connect + SIWE verification |
| `/overview`, `/assets`, `/transactions` | Dashboard |
| `/vesting`, `/claims` | Investor readiness |
| `/security`, `/transparency`, `/official-domains` | Trust center |
| `/support`, `/install`, `/account`, `/settings` | App utilities |

### Redirected to entelewallet.com

Marketing paths in this app redirect permanently to the website:

- `/roadmap` → `https://entelewallet.com/roadmap`
- `/ecosystem` → `https://entelewallet.com/ecosystem`
- `/legal` → `https://entelewallet.com/legal`
- `/privacy` → `https://entelewallet.com/privacy`
- `/terms` → `https://entelewallet.com/terms`
- `/risk` → `https://entelewallet.com/risk`
- `/disclaimer` → `https://entelewallet.com/disclaimer`

Redirects are enforced at three layers:

1. **Next.js** — `apps/web/next.config.js` (`redirects`)
2. **Vercel** — `apps/web/vercel.json` (`redirects` + security `headers`)
3. **Middleware** — `apps/web/src/middleware.ts` (alias host 308 redirects)

Use `websiteUrl()` from `@entelewallet/config` for in-app links to the marketing site.

## Vercel projects

Deploy each repo as a separate Vercel project:

### entelewallet-app

| Setting | Value |
|---------|-------|
| Root Directory | `apps/web` *(recommended)* or repo root with root `vercel.json` |
| Framework Preset | Next.js |
| Output Directory | *(blank — do not use `public`)* |
| Production Domain | `entelewallet.app` |
| Alias Domains | `www.entelewallet.app`, `app.entelewallet.com`, `www.app.entelewallet.com` |

Environment: see `apps/web/.env.example`

If deploy fails with **No Output Directory named "public"**, set Root Directory to `apps/web` and clear Output Directory in Vercel project settings. See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting-no-output-directory-named-public).

### entelewallet-site

| Setting | Value |
|---------|-------|
| Production Domain | `entelewallet.com` |
| Purpose | Marketing pages only |

## Supabase Auth

Magic-link auth callback URL (configure in Supabase dashboard):

```
https://entelewallet.app/auth/callback
```

Add `entelewallet.app` to Supabase **Redirect URLs**. Local dev may use `http://localhost:3000/auth/callback`.

## PWA

The web app manifest (`apps/web/public/manifest.webmanifest`) is scoped to `https://entelewallet.app/`. Install prompts and `start_url` point at the app domain, not the marketing site.

## Shared config

`packages/config/src/domains.ts` exports:

- `CANONICAL_APP_URL` — app links
- `CANONICAL_WEBSITE_URL` / `websiteUrl()` — marketing links
- `WEBSITE_ROUTES` — path map for entelewallet.com
- `MARKETING_REDIRECT_PATHS` — paths redirected out of the app

## Production checklist

- [ ] `entelewallet.app` on entelewallet-app Vercel project
- [ ] `entelewallet.com` on entelewallet-site Vercel project
- [ ] Alias domains 308-redirect to `entelewallet.app`
- [ ] Supabase redirect URL includes `https://entelewallet.app/auth/callback`
- [ ] WalletConnect allowlist includes `https://entelewallet.app`
- [ ] Marketing links in footer/vesting use `websiteUrl()`, not in-app routes
- [ ] `pnpm typecheck` and `pnpm build` pass
