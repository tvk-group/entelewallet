# Environment Variables

See `.env.example` for the full list.

## Required for Production

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (https://app.entelewallet.com) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

## Supabase (optional for Lite phase)

Supabase is **not required** to merge the PR, run locally, or pass Vercel build checks.

EnteleWALLET Lite currently uses an **in-memory nonce store** for wallet verification in development/preview. The SQL migrations in `supabase/migrations/` are prepared for production but are **not wired into the app yet**.

Create a Supabase project when you are ready for production persistence:

1. Create a project at [supabase.com](https://supabase.com) (e.g. name: `EnteleWALLET`)
2. Run the migration: `supabase/migrations/20260101000000_initial_schema.sql` in the SQL Editor
3. Add env vars to Vercel and `apps/web/.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)

Until then, wallet connect, SIWE verification, and the dashboard work without Supabase.

## Recommended

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Private Ethereum RPC endpoint |
| `NEXT_PUBLIC_BASE_RPC_URL` | Private Base RPC endpoint |

## Feature Flags

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
