# Environment Variables

See `.env.example` for the full list.

## Required for Production

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (https://app.entelewallet.com) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

## Supabase (account linking & auth)

Supabase is **optional** for local development and preview builds. Without it, wallet connect, SIWE verification, and the portfolio dashboard still work.

When Supabase is configured, the app enables:

- Magic-link sign-in at `/sign-in`
- Persisted SIWE verification events (`wallet_auth_events`)
- Investor wallet linking (`wallet_connections`)
- Session refresh via middleware

Setup:

1. Create a project at [supabase.com](https://supabase.com) (e.g. name: `EnteleWALLET`)
2. Run the migration: `supabase/migrations/20260101000000_initial_schema.sql` in the SQL Editor
3. Add env vars to Vercel and `apps/web/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — required for wallet linking persistence)
4. In Supabase Auth → URL Configuration, add redirect URL: `https://entelewallet.app/auth/callback`

Until Supabase is configured, wallet linking UI shows a configuration notice and link API returns `503`.

## Recommended

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Private Ethereum RPC endpoint |
| `NEXT_PUBLIC_BASE_RPC_URL` | Private Base RPC endpoint |
| `ALCHEMY_API_KEY` | Server-only Alchemy key for ERC-20 auto-discovery and multi-network token balances |

## Portfolio (Phases B–E)

| Variable | Description |
|----------|-------------|
| `ALCHEMY_API_KEY` | Required for auto-discovered ERC-20 tokens (`/api/portfolio/discover`). Set in Vercel for all preview/production environments. Never expose as `NEXT_PUBLIC_*`. |
| `NEXT_PUBLIC_ENTELEKRON_URL` | EnteleKRON platform base for preferences/watchlist sync (default `https://entelekron.io`) |

Preferences and watchlist sync via `/api/user/*` BFF routes when an EnteleKRON session cookie or Bearer token is present; otherwise localStorage fallback applies.


| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_ENABLE_WALLET_CONNECT` | true | Enable wallet connection |
| `NEXT_PUBLIC_ENABLE_CLAIMS` | false | Enable claims (must stay false until ready) |

## Missing WalletConnect Project ID

- Development: shows configuration warning, app does not crash
- Production: WalletConnect wallets unavailable; injected wallets still work

## Contact

| Variable | Default |
|----------|---------|
| `GENERAL_CONTACT_EMAIL` | contact@entelewallet.com |
| `SUPPORT_EMAIL` | support@entelewallet.com |
| `SECURITY_CONTACT_EMAIL` | security@entelewallet.com |
| `LEGAL_CONTACT_EMAIL` | legal@entelewallet.com |
