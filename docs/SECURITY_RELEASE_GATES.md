# Security Release Gates

EnteleWALLET uses enforceable release gates to prevent dangerous functionality from reaching production without intentional review.

## Dangerous Features (source-code only)

The following flags **cannot** be enabled via `NEXT_PUBLIC_*` environment variables. Enabling any of them requires:

1. Intentional change to `packages/config/src/features.ts` (set flag to `true`)
2. Unit and integration tests for the new surface
3. Security review and updated threat model
4. A separate PR — never bundled with unrelated work

| Flag                         | Capability blocked              |
| ---------------------------- | ------------------------------- |
| `ENABLE_CREATE_WALLET`       | In-app wallet creation          |
| `ENABLE_IMPORT_WALLET`       | Seed phrase / mnemonic import   |
| `ENABLE_PRIVATE_KEY_STORAGE` | Browser or server key storage   |
| `ENABLE_SEND_TOKENS`         | Outbound transfers              |
| `ENABLE_SWAP`                | Token swaps                     |
| `ENABLE_MOBILE_WALLET`       | Mobile key storage              |
| `ENABLE_BROWSER_EXTENSION`   | Extension key storage           |
| `ENABLE_ACCOUNT_ABSTRACTION` | Smart account / AA flows        |
| `ENABLE_WALLET_ONLY_LOGIN`   | Wallet-only auth without review |

## Safe Environment-Overridable Flags

These may be toggled via `NEXT_PUBLIC_*` for staged rollouts:

| Flag                         | Default |
| ---------------------------- | ------- |
| `ENABLE_WALLET_CONNECT`      | `true`  |
| `ENABLE_WALLET_VERIFICATION` | `true`  |
| `ENABLE_CLAIMS`              | `false` |
| `ENABLE_BASE_ACCOUNT`        | `false` |

## Build-Time Enforcement

`pnpm security:check` runs in CI and verifies:

- Dangerous flags are `false` in source
- `isFeatureEnabled()` blocks env override for dangerous flags
- `.env.example` files do not enable dangerous flags
- No direct `process.env.NEXT_PUBLIC_ENABLE_*` reads for dangerous flags
- Production nonce storage fails closed (no silent memory fallback)
- Root `pnpm test` is a real test runner (not a placeholder)

## Production SIWE Requirements

| Requirement                   | Enforcement                               |
| ----------------------------- | ----------------------------------------- |
| Persistent nonce storage      | Supabase `wallet_auth_nonces`             |
| Fail closed if DB unavailable | `NonceStorageUnavailableError` → HTTP 503 |
| Memory fallback               | Development and test only                 |
| Atomic nonce consumption      | `consume_wallet_nonce()` SQL function     |
| Unique nonces                 | Unique index on `(wallet_address, nonce)` |

## HTTP Security Headers

Applied via middleware (`apps/web/src/lib/security-headers.ts`):

| Header                                | Production                        |
| ------------------------------------- | --------------------------------- |
| `Strict-Transport-Security`           | Yes                               |
| `X-Content-Type-Options`              | `nosniff`                         |
| `Referrer-Policy`                     | `strict-origin-when-cross-origin` |
| `Permissions-Policy`                  | Restrictive defaults              |
| `X-Frame-Options`                     | `DENY`                            |
| `frame-ancestors`                     | `'none'` (via CSP)                |
| `Cross-Origin-Opener-Policy`          | `same-origin`                     |
| `Cross-Origin-Resource-Policy`        | `same-site`                       |
| `Content-Security-Policy-Report-Only` | Yes (monitor before enforce)      |

## CSP Origin Inventory

Documented in `apps/web/src/lib/security-headers.ts` (`CSP_ORIGIN_INVENTORY`):

- **WalletConnect / Reown:** relay, verify, explorer, web3modal APIs
- **Supabase:** `*.supabase.co` (REST + realtime)
- **RPC:** Alchemy, Infura, public nodes, Sui, Koios
- **Pricing:** CoinGecko, CoinMarketCap
- **Images:** CoinGecko/CMC asset CDNs, `data:` URIs
- **Fonts:** Google Fonts (if used)
- **Analytics:** none currently

Do not add broad wildcards or `unsafe-eval` to silence violations. Fix violations by narrowing sources or refactoring.

## CI Pipeline (every PR)

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm i18n:check`
6. `pnpm security:check`
7. `pnpm test`
8. `pnpm build`
9. Playwright smoke tests

CodeQL (JavaScript/TypeScript) runs weekly. Dependabot opens weekly dependency PRs.

**No workflow auto-merges or auto-deploys.**

## Pre-Merge Checklist

- [ ] `pnpm security:check` passes
- [ ] All tests pass
- [ ] No dangerous flags enabled
- [ ] Supabase migration applied if schema changed
- [ ] Threat model updated if attack surface changed
- [ ] CSP report-only violations reviewed
