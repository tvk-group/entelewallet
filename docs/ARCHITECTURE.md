# Architecture

## Overview

EnteleWALLET Lite is a TypeScript monorepo built with pnpm workspaces and Turborepo.

```
entelewallet/
├── apps/web/              # Next.js App Router application
├── packages/
│   ├── config/            # Domains, routes, feature flags, tokens, chains
│   ├── wallet-core/       # SIWE verification helpers (no private keys)
│   ├── security/          # Security copy and domain constants
│   ├── blockchain/        # Explorer links, ERC-20 ABI, multicall
│   ├── i18n/              # 25-language translation system
│   ├── ui/                # Shared UI components
│   ├── types/             # Shared TypeScript types
│   └── utils/             # Utilities (address normalization, cn)
├── docs/                  # Documentation
├── scripts/               # i18n check, security check
└── supabase/migrations/   # Database schema
```

## Key Decisions

- **SIWE (EIP-4361)** for wallet ownership verification — standard format wallets render clearly
- **RainbowKit + wagmi + viem** for wallet connection modal
- **Single routing pattern** — top-level routes only (no `/dashboard/wallet/*` duplication)
- **Multicall batching** via wagmi `useReadContracts` for ERC-20 balance reads
- **Single source of truth** for token contracts and treasury addresses (shared with EnteleKRON platform)

## Wallet Verification Flow

1. User connects wallet via RainbowKit modal
2. User clicks "Verify Ownership"
3. Server creates one-time nonce (POST `/api/wallet/nonce`)
4. Client signs SIWE message (no gas, no transaction)
5. Server verifies signature (POST `/api/wallet/verify`)
6. Nonce marked used; wallet status becomes verified

## Domain Model

- **Canonical app:** `entelewallet.app`
- **Official domains:** entelewallet.app, entelewallet.com, entelekron.io, tvk.group
- **Redirects:** app.entelewallet.com, www.entelewallet.app, wallet.entelekron.io, entelewallet.org → entelewallet.app

## Future Architecture

Phase 2 adds account layer (TVK ID, EnteleVAULT prep). Phase 3 adds full non-custodial wallet (create/import, key storage, send/receive). Phase 3 features are documented but not implemented.
