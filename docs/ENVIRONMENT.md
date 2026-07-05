# Environment Variables

See `.env.example` for the full list.

## Required for Production

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Canonical app URL (https://app.entelewallet.com) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

## Recommended

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Private Ethereum RPC endpoint |
| `NEXT_PUBLIC_BASE_RPC_URL` | Private Base RPC endpoint |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase key |

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
| `SECURITY_CONTACT_EMAIL` | security@tvk.group |
| `SUPPORT_EMAIL` | support@tvk.group |
