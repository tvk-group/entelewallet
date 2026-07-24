# Platform Architecture

This document describes EnteleWALLET's multi-platform target architecture and the security boundaries between platforms. **No platform application scaffolds are included in Phase 0** — this is architecture documentation only.

## Application Targets

| Platform                          | Path                                    | Status                                  |
| --------------------------------- | --------------------------------------- | --------------------------------------- |
| Progressive Web App               | `apps/web`                              | **Current** — production Lite dashboard |
| Android native                    | `apps/mobile` (future)                  | Planned                                 |
| iOS native                        | `apps/mobile` (future)                  | Planned                                 |
| Windows desktop (Microsoft Store) | `apps/desktop` (future)                 | Planned                                 |
| Browser extension                 | `apps/extension` (future)               | Planned                                 |
| Safari Web Extension              | packaged from extension target (future) | Planned                                 |

## Shared Packages (read-only / non-custodial today)

```
packages/
├── config/         # Domains, feature flags, chains
├── wallet-core/    # SIWE verification (no private keys)
├── security/       # Security copy and constants
├── blockchain/     # Explorer links, read-only chain helpers
├── i18n/           # Translations
├── ui/             # Shared UI components
├── types/          # Shared TypeScript types
└── utils/          # Address normalization, helpers
```

**Rule:** Shared JavaScript/TypeScript packages must never contain raw private keys, seed material, or platform-specific key storage implementations.

## Platform Key Boundaries

Each native or extension platform owns its key material through OS-provided secure storage. Keys never pass through shared web packages.

### Android (`apps/mobile` — future)

- **Keystore / StrongBox** for key generation and signing
- Hardware-backed keys where available
- Biometric gate (BiometricPrompt) before signing
- No key export; no shared JS key storage

### iOS (`apps/mobile` — future)

- **Secure Enclave** for key generation when supported
- **Keychain** with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- LocalAuthentication (Face ID / Touch ID) before signing
- No key export; App Sandbox isolation

### Windows (`apps/desktop` — future)

- **TPM** / **Windows Hello** for device-bound keys
- DPAPI or Credential Locker for auxiliary secrets
- Microsoft Store packaging with integrity checks
- No plaintext key files on disk

### Browser Extension (`apps/extension` — future)

- **Extension-isolated encrypted storage** (chrome.storage with encryption, or platform vault)
- Content script isolation from page JavaScript
- Origin allowlist for injected scripts
- Separate signing surface from web app — extension keys never shared with `apps/web`

### Safari Web Extension (future)

- Packaged from extension codebase with Safari-specific manifest
- Keychain-backed storage via native messaging bridge
- App Store review compliance for extension permissions

## PWA (`apps/web` — current)

Phase 0–1 scope:

- Wallet **connection** via WalletConnect / injected providers (keys remain in user's wallet)
- SIWE verification only — no custody
- Server-side nonce storage (Supabase)
- No browser key storage, no seed phrases, no private keys

## Cross-Platform Principles

1. **No raw private keys in shared packages** — platform apps implement signing natively
2. **Crypto-agile, versioned algorithms** — see `docs/POST_QUANTUM_ARCHITECTURE.md`
3. **Feature flags gate dangerous capabilities** — see `docs/SECURITY_RELEASE_GATES.md`
4. **Independent security audit** required before any platform stores keys
5. **EnteleKRON consensus separation** — wallet safeguards ≠ network consensus rules

## Future Phase Gates

Before implementing `apps/mobile`, `apps/desktop`, or `apps/extension`:

- [ ] Updated threat model per platform
- [ ] Independent security audit scope defined
- [ ] Legal/compliance review
- [ ] Platform-specific key storage design review
- [ ] No empty scaffolds until audit plan approved

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — current monorepo layout
- [THREAT_MODEL.md](./THREAT_MODEL.md) — threat analysis
- [SECURITY_RELEASE_GATES.md](./SECURITY_RELEASE_GATES.md) — release controls
- [POST_QUANTUM_ARCHITECTURE.md](./POST_QUANTUM_ARCHITECTURE.md) — PQ migration research
- [PHASES.md](./PHASES.md) — product phases
