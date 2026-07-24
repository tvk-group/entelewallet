import { describe, expect, it, beforeEach } from 'vitest';
import { checkRateLimit, enforceWalletApiRateLimit, resetRateLimitsForTests } from './rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimitsForTests();
  });

  it('allows requests under the limit', () => {
    const result = checkRateLimit('test-key', 3, 60_000);
    expect(result.allowed).toBe(true);
  });

  it('blocks requests over the limit', () => {
    checkRateLimit('blocked-key', 2, 60_000);
    checkRateLimit('blocked-key', 2, 60_000);
    const blocked = checkRateLimit('blocked-key', 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('scopes wallet limits per IP+wallet without global wallet lockout', () => {
    const walletA = '0x1111111111111111111111111111111111111111';
    const walletB = '0x2222222222222222222222222222222222222222';

    for (let i = 0; i < 8; i++) {
      const result = enforceWalletApiRateLimit({
        scope: 'nonce',
        ip: '203.0.113.1',
        walletAddress: walletA,
      });
      expect(result.allowed).toBe(true);
    }

    const blockedA = enforceWalletApiRateLimit({
      scope: 'nonce',
      ip: '203.0.113.1',
      walletAddress: walletA,
    });
    expect(blockedA.allowed).toBe(false);

    const allowedB = enforceWalletApiRateLimit({
      scope: 'nonce',
      ip: '203.0.113.1',
      walletAddress: walletB,
    });
    expect(allowedB.allowed).toBe(true);
  });
});
