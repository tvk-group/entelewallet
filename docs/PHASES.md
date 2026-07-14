# Product Phases

## Phase 1: EnteleWALLET Lite (Current)

- Wallet connection via RainbowKit modal
- SIWE wallet ownership verification
- Asset balance monitoring (ENK, ETH, USDT, SOVRA, ENM)
- Transaction explorer links
- Vesting and claim readiness views
- Transparency integration
- Security center
- 25-language support

## Phase 2: Account Layer (In Progress)

- Supabase magic-link sign-in (`/sign-in`, `/auth/callback`)
- Investor wallet linking (SIWE verify → link to Supabase account)
- Wallet connection persistence (`wallet_connections`, `wallet_auth_events`)
- Best-effort sync to EnteleKRON `/api/wallet/link`
- TVK ID integration (planned)
- EnteleVAULT recovery preparation (planned)
- Risk scoring (planned)
- Malicious approval warnings (planned)
- Notification center (planned)

## Phase 3: Full Non-Custodial EnteleWALLET

- Create/import wallet
- Encrypted local key storage
- Mobile secure enclave
- Send/receive
- WalletConnect wallet mode
- Hardware wallet support
- Browser extension
- Transaction simulation
- Smart accounts
- Recovery architecture
- Security audits and bug bounty

**Phase 3 requires formal security architecture, independent audits and legal review before any implementation.**

## Mobile & Extension

Documented here rather than scaffolded as empty app folders. Will be added when Phase 2/3 begins.
