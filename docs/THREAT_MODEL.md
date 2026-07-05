# Threat Model

## Scope

EnteleWALLET Lite — wallet connection, verification, and read-only dashboard.

## Threats and Mitigations

| Threat | Mitigation |
|--------|-----------|
| Phishing / fake domains | Short official domain list; Security Center; domain verification in SIWE |
| Malicious signatures | SIWE standard format; clear statement text; no approval-like messages |
| Wallet draining approvals | No send/swap/approve features in Lite; signature warnings |
| Seed phrase theft | Never request seed phrases; prominent warnings |
| Private key exposure | No key storage or import; feature flags disabled |
| Fake support contacts | Official contact emails in config; report form |
| Dependency risk | pnpm lockfile; regular updates; security:check script |
| Supply-chain risk | Minimal dependencies; no auto-install scripts |
| RPC risk | Configurable RPC URLs; graceful per-token failure |
| Browser extension risk | Documented in Security Center; future extension in Phase 3 only |
| Mobile app risk | Not implemented in Lite; documented for Phase 3 |
| Smart contract wallet risk | Account abstraction disabled; future phase only |

## Residual Risks

- In-memory nonce store in dev (production: Supabase)
- User may sign malicious requests from other sites (education mitigates)
- RPC provider may log requests (use private RPC in production)

## Future Threats (Phase 3)

When full wallet features are implemented:
- Key storage encryption
- Biometric unlock
- Transaction simulation
- Malicious approval detection
- Independent security audit required before launch
