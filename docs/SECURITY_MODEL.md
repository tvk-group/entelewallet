# Security Model

## EnteleWALLET Lite Scope

EnteleWALLET Lite is **read-only and non-custodial**:

- Connects to existing wallets
- Verifies ownership via SIWE signatures
- Displays balances and ecosystem status
- Links to transparency and security resources

## What Lite Does NOT Do

- Store seed phrases or private keys
- Create or import wallets
- Custody funds
- Send tokens, swap, stake, or trade
- Request spending approvals

## Verification Security

| Control        | Implementation                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| Signature type | SIWE (EIP-4361) — ownership only                                               |
| Nonce expiry   | 8 minutes                                                                      |
| Nonce reuse    | Single-use, marked after verification                                          |
| Domain check   | Must match the browser origin on an allowed host (`entelewallet.app` or alias) |
| Chain ID       | Stored and verified                                                            |
| Gas cost       | Zero — signature only, no transaction                                          |

## Feature Flags

Dangerous features are disabled by default in `packages/config/src/features.ts`:

- `ENABLE_CREATE_WALLET=false`
- `ENABLE_IMPORT_WALLET=false`
- `ENABLE_PRIVATE_KEY_STORAGE=false`
- `ENABLE_SEND_TOKENS=false`
- `ENABLE_SWAP=false`

## Database Security

- RLS enabled on all Supabase tables
- No private keys or seed phrases stored
- Wallet addresses are public on-chain data
- Auth events logged with hashed IP/user-agent

## User-Facing Warnings

All pages display:

- Lite custody warning
- Signature safety warning on connect/verify flows
- Official domain list in Security Center
