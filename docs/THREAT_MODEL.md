# Threat Model — EnteleWALLET

## Scope

EnteleWALLET Lite (Phase 0–1): wallet connection, SIWE verification, and read-only portfolio dashboard. This document covers threats to the current release and residual risks accepted until later phases.

Out of scope for this release: wallet creation, seed import, private-key storage, token transfers, swaps, staking, smart accounts, browser-extension key storage, and post-quantum cryptographic implementations.

## Assets

| Asset                        | Sensitivity                                   |
| ---------------------------- | --------------------------------------------- |
| User wallet addresses        | Medium — public on-chain but privacy-relevant |
| SIWE nonces and messages     | High — replay enables impersonation           |
| Verification session cookies | High — proves recent ownership                |
| Supabase auth sessions       | High — links wallets to accounts              |
| RPC/API keys (server)        | High                                          |
| Dependency supply chain      | High                                          |

## Threats and Mitigations

### Phishing and fake domains

**Threat:** Attackers host clones at look-alike domains to harvest signatures or credentials.

**Mitigations:**

- Canonical domain `entelewallet.app` with 308 redirects from known aliases
- SIWE domain and URI validation against server-stored expectations
- Security Center lists official domains (`packages/config/src/domains.ts`)
- CSP `frame-ancestors 'none'` prevents clickjacking embeds

**Residual:** Users may still visit unlisted phishing domains; education and browser warnings remain necessary.

### Malicious browser extensions

**Threat:** Extensions inject scripts, replace addresses, or intercept clipboard contents.

**Mitigations:**

- No in-browser key storage in Lite
- CSP limits script sources (report-only monitoring first)
- Security Center guidance on extension risk

**Residual:** Extensions operate outside the app trust boundary.

### Compromised RPC providers

**Threat:** RPC nodes return false balances, censor reads, or log wallet addresses.

**Mitigations:**

- Configurable private RPC URLs
- Graceful per-token failure; no transaction submission in Lite
- Documented recommendation for production RPC

**Residual:** Portfolio display depends on RPC honesty.

### WalletConnect session abuse

**Threat:** Stale sessions, malicious dApp pairing, or origin spoofing via WalletConnect relay.

**Mitigations:**

- Reown/WalletConnect origin allowlist enforced in cloud dashboard
- Runtime origin monitoring and user warnings
- Lite performs SIWE only — no transaction broadcast

**Residual:** Users may approve connections on malicious sites outside EnteleWALLET.

### Signature and approval deception

**Threat:** Users sign messages that resemble token approvals or transfers.

**Mitigations:**

- SIWE-only verification with fixed statement text (`SIWE_STATEMENT`)
- No `eth_sendTransaction` or approval flows in Lite
- Pre-connect safety modal and signature warnings

**Residual:** Other sites can still request dangerous signatures.

### XSS and supply-chain compromise

**Threat:** Injected scripts steal sessions, cookies, or manipulate DOM.

**Mitigations:**

- React escaping; no `dangerouslySetInnerHTML` for user content
- CSP report-only with inventoried origins
- Security headers (HSTS, nosniff, COOP, CORP)
- pnpm lockfile, CI security check, CodeQL, Dependabot
- Dangerous features gated in source — not env-toggleable

**Residual:** `unsafe-inline` required by Next.js until nonce-based CSP is adopted.

### Address poisoning

**Threat:** Attackers send dust from addresses visually similar to known contacts; users copy wrong address.

**Mitigations:**

- Read-only dashboard — no send flow
- Full-address display with LTR spans
- Education in Security Center

**Residual:** Clipboard manipulation outside the app.

### Clipboard manipulation

**Threat:** Malware or extensions replace copied addresses.

**Mitigations:**

- No copy-to-send shortcuts for outbound transfers in Lite
- User education

**Residual:** OS-level clipboard attacks.

### Backend and database compromise

**Threat:** Attacker gains Supabase service-role access or modifies nonce table.

**Mitigations:**

- RLS denies client access to `wallet_auth_nonces`
- Atomic `consume_wallet_nonce` prevents replay
- Unique constraint on `(wallet_address, nonce)`
- Service role key server-only
- Verification GET requires session cookie or linked account

**Residual:** Full service-role compromise bypasses app-layer controls.

### Device theft

**Threat:** Unattended unlocked device exposes connected wallet session.

**Mitigations:**

- No key material on device
- Wallet disconnect available
- HttpOnly verification cookie

**Residual:** Physical access to unlocked browser with connected wallet.

### Recovery abuse

**Threat:** Future recovery flows could be targeted for account takeover.

**Mitigations:**

- Recovery not implemented in Lite
- Documented as Phase 3+ with audit requirement

### Future quantum attacks

**Threat:** Cryptographically relevant quantum computers break ECDSA used by EVM wallets.

**Mitigations:**

- Documented post-quantum architecture (`docs/POST_QUANTUM_ARCHITECTURE.md`)
- No false "quantum-proof" marketing
- Hybrid migration strategy reserved for future phases

**Residual:** EVM consensus and transaction rules remain classical until network upgrades.

## SIWE-Specific Threats

| Threat                     | Control                                                    |
| -------------------------- | ---------------------------------------------------------- |
| Nonce replay               | Atomic consume; single-use; expiry                         |
| Concurrent reuse           | DB-level conditional UPDATE                                |
| Domain mismatch            | Server-stored domain vs message                            |
| Message tampering          | Exact string equality with stored message                  |
| Production without DB      | Fail closed — no memory fallback                           |
| Enumeration via verify GET | Cookie or linked-account required                          |
| Rate-based DoS             | Per-IP and per-IP+wallet limits (no global wallet lockout) |

## Residual Risks (accepted for Lite)

1. CSP is report-only until violation inventory is complete
2. In-memory nonce fallback allowed only in development/test
3. Users may sign malicious requests on other websites
4. RPC providers may log requests
5. Rate limiting is per-instance (serverless) — not globally distributed

## Phase 3+ Requirements

Before wallet creation, key storage, or transaction features:

- Independent security audit
- Legal/compliance review
- Updated threat model and penetration test
- Post-quantum architecture review where applicable
