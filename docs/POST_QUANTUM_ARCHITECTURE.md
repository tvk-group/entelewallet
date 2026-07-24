# Post-Quantum Architecture (Research & Future Planning)

This document defines EnteleWALLET's approach to post-quantum (PQ) cryptography. **No post-quantum implementations ship in Phase 0–1.** This is architecture and research guidance only.

## Principles

1. **Crypto-agile design** — algorithm identifiers are versioned strings, not implicit defaults
2. **Hybrid migration** — combine classical and PQ algorithms during transition periods
3. **No custom cryptography** — use NIST-standardized algorithms via audited libraries only
4. **No "quantum-proof" marketing** — honest communication about limitations
5. **Separation of concerns** — wallet safeguards ≠ EnteleKRON consensus layer

## Current EVM Limitations

Ethereum and EVM-compatible networks today require **ECDSA (secp256k1)** signatures for externally owned accounts (EOAs). Transaction `v/r/s` fields and `ecrecover` precompile are classical.

Implications:

- On-chain authorization remains classical until hard-fork/upgrades adopt PQ schemes
- Wallet apps can add **off-chain** PQ or hybrid proofs, but cannot replace EVM tx signatures unilaterally
- Smart contract wallets (ERC-4337) could verify PQ signatures in custom validators — gated behind `ENABLE_ACCOUNT_ABSTRACTION` (disabled)

## Versioned Algorithm Identifiers

Future configuration will use explicit identifiers:

```typescript
// Illustrative — not implemented
type SignatureAlgorithmId = 'evm-secp256k1-v1' | 'hybrid-secp256k1-ml-dsa-65-v1' | 'ml-dsa-65-v1';

type KemAlgorithmId = 'classical-x25519-v1' | 'hybrid-x25519-ml-kem-768-v1' | 'ml-kem-768-v1';
```

Clients and servers negotiate algorithms via versioned API headers or envelope metadata. Unknown identifiers are rejected.

## Hybrid Classical / Post-Quantum Migration Strategy

### Phase A — Research (current)

- Document threat timeline and NIST standards (ML-DSA, ML-KEM, SLH-DSA)
- Monitor Ethereum PQ roadmap and ERC proposals
- No user-facing PQ features

### Phase B — Off-chain hybrid authorization (future)

- **ML-DSA (FIPS 204)** or **SLH-DSA (FIPS 205)** for supplemental authorization proofs
- Classical ECDSA SIWE remains required for EVM compatibility
- Hybrid verification: both classical and PQ signatures must validate during transition

### Phase C — Encrypted recovery envelopes (future)

- **ML-KEM (FIPS 203)** for encrypting recovery payloads at rest
- Recovery shards encrypted to user-held PQ public keys
- Decryption requires PQ private key + classical factors where applicable

### Phase D — On-chain PQ (network-dependent)

- Follow EnteleKRON / Ethereum network upgrades for native PQ transaction types
- Wallet follows network capability flags — no premature custom tx formats

## ML-DSA / SLH-DSA Authorization Research

Research topics (not implemented):

| Topic                  | Notes                                                           |
| ---------------------- | --------------------------------------------------------------- |
| ML-DSA-65 vs ML-DSA-87 | Size/latency tradeoffs for mobile wallets                       |
| SLH-DSA statefulness   | Hash-based signatures — state management complexity             |
| Hybrid binding         | Ensure PQ proof is cryptographically bound to classical address |
| Replay resistance      | PQ proofs must include domain, chain, nonce, expiry             |
| Library selection      | BoringSSL, liboqs, or audited WASM ports — TBD                  |

## ML-KEM Recovery Envelopes (future)

Recovery data structures (illustrative):

```
Envelope {
  version: "recovery-envelope-v1"
  kem: "ml-kem-768-v1"
  ciphertext: bytes
  associatedData: { walletId, createdAt, policyVersion }
}
```

Requirements:

- No plaintext seed material in logs or analytics
- Envelope versioning for algorithm rotation
- Separate from SIWE nonce table

## Wallet vs EnteleKRON Consensus

| Layer                | Responsibility                                           |
| -------------------- | -------------------------------------------------------- |
| EnteleWALLET         | User-facing signing, verification, key handling (future) |
| EnteleKRON consensus | Block validation, network-wide signature rules           |

EnteleWALLET must not invent parallel consensus rules. PQ transaction formats follow network specifications.

## Prohibited Practices

- Custom elliptic curves or hash functions
- Rolling your own ML-DSA / ML-KEM implementation
- Marketing claims of "quantum-proof" or "unbreakable" security
- Enabling PQ code paths via environment variables without source review

## Review Triggers

Revisit this document when:

- NIST PQ standards are mandated for regulated deployments
- Ethereum PQ EIPs reach mainnet readiness
- EnteleWALLET Phase 3 key storage is approved for development
- Independent security audit scope includes PQ

## References

- NIST FIPS 203 (ML-KEM), 204 (ML-DSA), 205 (SLH-DSA)
- EIP-4361 (SIWE) — current ownership verification
- Ethereum Foundation PQ research updates
