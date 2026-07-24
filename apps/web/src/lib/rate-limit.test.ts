import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  deriveClientIdentifier,
  enforceWalletApiRateLimit,
  resetRateLimitsForTests,
} from './rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimitsForTests();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('WALLET_VERIFICATION_SECRET', 'a'.repeat(64));
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

  it('derives HMAC bucket keys without exposing raw IP', () => {
    const { ipKey } = deriveClientIdentifier('203.0.113.1');
    expect(ipKey).not.toContain('203.0.113.1');
    expect(ipKey).toMatch(/^[0-9a-f]{64}$/);
  });

  it('scopes wallet limits per IP+wallet without global wallet lockout', async () => {
    const walletA = '0x1111111111111111111111111111111111111111';
    const walletB = '0x2222222222222222222222222222222222222222';

    for (let i = 0; i < 8; i++) {
      const result = await enforceWalletApiRateLimit({
        scope: 'nonce',
        ip: '203.0.113.1',
        walletAddress: walletA,
      });
      expect(result.allowed).toBe(true);
    }

    const blockedA = await enforceWalletApiRateLimit({
      scope: 'nonce',
      ip: '203.0.113.1',
      walletAddress: walletA,
    });
    expect(blockedA.allowed).toBe(false);

    const allowedB = await enforceWalletApiRateLimit({
      scope: 'nonce',
      ip: '203.0.113.1',
      walletAddress: walletB,
    });
    expect(allowedB.allowed).toBe(true);
  });

  it('handles concurrent increments without exceeding limit in memory mode', async () => {
    const limit = 5;
    const key = 'concurrent-key';

    const results = await Promise.all(
      Array.from({ length: 20 }, () => Promise.resolve(checkRateLimit(key, limit, 60_000))),
    );

    const allowedCount = results.filter((result) => result.allowed).length;
    expect(allowedCount).toBeLessThanOrEqual(limit);
    expect(allowedCount).toBeGreaterThan(0);
  });

  it('fails closed on deployed production when persistent storage is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    delete process.env.WALLET_VERIFICATION_SECRET;
    delete process.env.RATE_LIMIT_HMAC_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    await expect(
      enforceWalletApiRateLimit({
        scope: 'verify',
        ip: '203.0.113.2',
      }),
    ).rejects.toThrow('rate_limit_storage_unavailable');
  });
});
