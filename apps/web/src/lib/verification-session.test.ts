import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  canReadVerificationStatus,
  createVerificationCookieValue,
  createVerificationPayload,
  getSecretByteLength,
  getVerificationSecret,
  parseVerificationCookieValue,
  VerificationSecretUnavailableError,
} from './verification-session';

const TEST_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const TEST_SECRET = 'a'.repeat(64);
const FALLBACK_DEV_SECRET = 'test-verification-secret-with-32-byte-minimum-length!!';

describe('verification session security', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VITEST', 'true');
    delete process.env.WALLET_VERIFICATION_SECRET;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('requires WALLET_VERIFICATION_SECRET in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(() => getVerificationSecret()).toThrow(VerificationSecretUnavailableError);
  });

  it('rejects production secrets shorter than 32 bytes', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('WALLET_VERIFICATION_SECRET', 'too-short');
    expect(() => getVerificationSecret()).toThrow(VerificationSecretUnavailableError);
    expect(getSecretByteLength(TEST_SECRET)).toBeGreaterThanOrEqual(32);
  });

  it('does not accept forged cookies signed with the dev fallback secret in production', () => {
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    const forged = createVerificationCookieValue(payload, FALLBACK_DEV_SECRET);

    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('WALLET_VERIFICATION_SECRET', TEST_SECRET);

    expect(parseVerificationCookieValue(forged)).toBeNull();
  });

  it('rejects modified payload signatures', () => {
    vi.stubEnv('WALLET_VERIFICATION_SECRET', TEST_SECRET);
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    const value = createVerificationCookieValue(payload, TEST_SECRET);
    const tampered = value.slice(0, -4) + 'zzzz';
    expect(parseVerificationCookieValue(tampered, { secretOverride: TEST_SECRET })).toBeNull();
  });

  it('rejects expired cookies', () => {
    vi.stubEnv('WALLET_VERIFICATION_SECRET', TEST_SECRET);
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date(Date.now() - 60_000).toISOString(),
      maxAgeSeconds: 1,
    });
    const value = createVerificationCookieValue(payload, TEST_SECRET);
    expect(
      parseVerificationCookieValue(value, {
        secretOverride: TEST_SECRET,
        now: new Date(Date.now() + 5_000),
      }),
    ).toBeNull();
  });

  it('rejects saved-cookie replay after expiration', () => {
    vi.stubEnv('WALLET_VERIFICATION_SECRET', TEST_SECRET);
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
      maxAgeSeconds: 30,
    });
    const saved = createVerificationCookieValue(payload, TEST_SECRET);
    expect(
      parseVerificationCookieValue(saved, {
        secretOverride: TEST_SECRET,
        now: new Date(Date.now() + 60_000),
      }),
    ).toBeNull();
  });

  it('accepts a valid signed cookie', () => {
    vi.stubEnv('WALLET_VERIFICATION_SECRET', TEST_SECRET);
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    const value = createVerificationCookieValue(payload, TEST_SECRET);
    const parsed = parseVerificationCookieValue(value, { secretOverride: TEST_SECRET });
    expect(parsed?.sessionId).toBe(payload.sessionId);
    expect(parsed?.address).toBe(TEST_ADDRESS);
    expect(parsed?.chainId).toBe(1);
  });

  it('does not authorize wrong address reads', () => {
    const payload = createVerificationPayload({
      address: TEST_ADDRESS,
      chainId: 1,
      verifiedAt: new Date().toISOString(),
    });
    expect(
      canReadVerificationStatus('0x0000000000000000000000000000000000000001', payload, []),
    ).toBe(false);
  });
});
