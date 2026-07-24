# Environment Variables

See `.env.example` for the full list.

## Required for Production

| Variable                               | Description                                                                                                                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Canonical app URL (`https://entelewallet.app`)                                                                                                                                                                                                                                   |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Reown (WalletConnect) Cloud project ID — 32-char hex from [cloud.reown.com](https://cloud.reown.com). Aliases: `NEXT_PUBLIC_REOWN_PROJECT_ID`, `NEXT_PUBLIC_WC_PROJECT_ID`. **Must be set before `pnpm build` / Vercel deploy** (Next.js inlines `NEXT_PUBLIC_*` at build time). |

## Supabase (account linking & auth)

Supabase is **optional** for local development and preview builds. Without it, wallet connect, SIWE verification, and the portfolio dashboard still work.

When Supabase is configured, the app enables:

- Magic-link sign-in at `/sign-in`
- Persisted SIWE verification events (`wallet_auth_events`)
- Investor wallet linking (`wallet_connections`)
- Session refresh via middleware

Setup:

1. Create a project at [supabase.com](https://supabase.com) (e.g. name: `EnteleWALLET`)
2. Run migrations in the SQL Editor (safe to re-run):
   - `supabase/migrations/20260101000000_initial_schema.sql` (idempotent)
   - If the first run failed partway (e.g. `relation "idx_wallet_connections_address" already exists`), run `supabase/migrations/20260714000000_idempotent_repair.sql` instead — it completes any missing indexes, policies, and constraints.
   - Apply all migrations under `supabase/migrations/` in filename order, including `20260724200000_post_fortress_live_security.sql` (privileged RPC hardening, security report policy, pg_cron cleanup).
3. Add env vars to Vercel and `apps/web/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — required for wallet linking persistence, SIWE nonce consumption, distributed rate limiting, and security report storage)
4. In Supabase Auth → URL Configuration, add redirect URL: `https://entelewallet.app/auth/callback`

Until Supabase is configured, wallet linking UI shows a configuration notice and link API returns `503`. Public Vercel previews without Supabase and both server secrets fail closed for SIWE, rate limiting, and security report storage.

## Preview / staging deployments

Public Vercel preview URLs are **not** trusted by default for SIWE or WalletConnect. A working preview requires **both**:

1. **`PREVIEW_ORIGIN_ALLOWLIST`** — comma-separated exact origins allowed for SIWE nonce/verify (example: `https://staging.entelewallet.app`)
2. **Reown Dashboard → Project Domains** — add the same stable origin for WalletConnect

Recommended stable preview origin:

```text
https://staging.entelewallet.app
```

Do **not** add wildcard `*.vercel.app` domains. Each preview deployment URL must be listed explicitly if you choose to use per-branch URLs instead of a stable staging host.

See [WALLETCONNECT_SETUP.md](./WALLETCONNECT_SETUP.md) and [SUPABASE_CRON.md](./SUPABASE_CRON.md).

## Recommended

| Variable                       | Description                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Private Ethereum RPC endpoint                                                                         |
| `NEXT_PUBLIC_BASE_RPC_URL`     | Private Base RPC endpoint                                                                             |
| `ALCHEMY_API_KEY`              | Server-only Alchemy key for ERC-20 auto-discovery and multi-network token balances                    |
| `COINGECKO_API_KEY`            | Optional CoinGecko demo API key for higher rate limits on `/api/prices` and `/api/markets/search`     |
| `COINMARKETCAP_API_KEY`        | Optional CoinMarketCap Pro API key — silent failover on `/api/prices` when CoinGecko returns no quote |
| `NEXT_PUBLIC_WALLET_IDLE_MS`   | Auto-disconnect wallet after inactivity in ms (default `180000` = 3 minutes)                          |

## Portfolio (Phases B–E)

| Variable                     | Description                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ALCHEMY_API_KEY`            | Required for auto-discovered ERC-20 tokens (`/api/portfolio/discover`). Set in Vercel for all preview/production environments. Never expose as `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_ENTELEKRON_URL` | EnteleKRON platform base for preferences/watchlist sync (default `https://entelekron.io`)                                                                       |
| `WALLET_VERIFICATION_SECRET` | Server-only HMAC secret for signed wallet verification cookies (min 32 bytes; `openssl rand -hex 32`)                                                           |
| `RATE_LIMIT_HMAC_SECRET`     | Server-only HMAC secret for distributed rate-limit bucket keys (min 32 bytes; **must differ** from `WALLET_VERIFICATION_SECRET`)                                |
| `PREVIEW_ORIGIN_ALLOWLIST`   | Comma-separated exact origins for SIWE on preview/staging (e.g. `https://staging.entelewallet.app`)                                                             |

Preferences and watchlist sync via `/api/user/*` BFF routes when an EnteleKRON session cookie or Bearer token is present; otherwise localStorage fallback applies.

| Variable                            | Default | Description                                 |
| ----------------------------------- | ------- | ------------------------------------------- |
| `NEXT_PUBLIC_ENABLE_WALLET_CONNECT` | true    | Enable wallet connection                    |
| `NEXT_PUBLIC_ENABLE_CLAIMS`         | false   | Enable claims (must stay false until ready) |

## Missing WalletConnect Project ID

- Development: shows configuration warning, app does not crash
- Production: WalletConnect wallets unavailable; injected wallets still work

## Contact

| Variable                 | Default                   |
| ------------------------ | ------------------------- |
| `GENERAL_CONTACT_EMAIL`  | contact@entelewallet.com  |
| `SUPPORT_EMAIL`          | support@entelewallet.com  |
| `SECURITY_CONTACT_EMAIL` | security@entelewallet.com |
| `LEGAL_CONTACT_EMAIL`    | legal@entelewallet.com    |
