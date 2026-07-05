# Future Full EnteleWALLET

Full non-custodial wallet features are **not active in EnteleWALLET Lite**.

## Planned Features (Future Phase Only)

- Wallet creation and seed phrase generation
- Wallet import (seed phrase, private key)
- Encrypted local key storage
- Mobile app with secure enclave / keychain
- Biometric unlock
- Send and receive tokens
- WalletConnect wallet mode (act as wallet, not just connect)
- Hardware wallet integration
- Browser extension
- Transaction simulation
- Smart account / account abstraction support
- Recovery architecture
- Independent security audits
- Bug bounty program

## Requirements Before Implementation

1. **Security architecture document** — key management, encryption, recovery
2. **Independent security audit** — planned and budgeted
3. **Legal review** — jurisdictional compliance, terms of service
4. **Feature flag approval** — formal sign-off to enable dangerous flags

## Current State

All dangerous feature flags in `packages/config/src/features.ts` are set to `false`. The UI does not expose create wallet, import wallet, send, swap, or key storage functionality.

This repository must never add seed phrase, private key, custody, transfer, swap or exchange functionality without formal security architecture, independent audit planning and legal approval.
