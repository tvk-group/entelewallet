# EnteleWALLET Documentation

EnteleWALLET Lite is the first production phase of the EnteleWALLET master wallet product for the EnteleKRON and TVK Group ecosystem.

## Documents

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and monorepo structure |
| [SECURITY_MODEL.md](./SECURITY_MODEL.md) | Security model and verification flow |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | Threat model and mitigations |
| [PHASES.md](./PHASES.md) | Product phases (Lite → Account → Full Wallet) |
| [FUTURE_FULL_WALLET.md](./FUTURE_FULL_WALLET.md) | Future non-custodial wallet plan |
| [LEGAL_AND_COMPLIANCE_NOTES.md](./LEGAL_AND_COMPLIANCE_NOTES.md) | Legal and compliance notes |
| [I18N.md](./I18N.md) | Internationalization system |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guide |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment variables |
| [ENTELEWALLET-PORTFOLIO-TASKLIST.md](./ENTELEWALLET-PORTFOLIO-TASKLIST.md) | Portfolio screens, API contracts, phased checklist |

## Quick Start

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

## Security Warning

This repository must never add seed phrase, private key, custody, transfer, swap or exchange functionality without formal security architecture, independent audit planning and legal approval.
