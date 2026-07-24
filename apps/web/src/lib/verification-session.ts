import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { isProductionRuntime } from '@entelewallet/config';
import { normalizeAddress } from '@entelewallet/utils';

const COOKIE_NAME = 'ew-wallet-verification';
const MAX_AGE_SECONDS = 60 * 60 * 24;
const DEV_TEST_SECRET = 'test-verification-secret-with-32-byte-minimum-length!!';

export interface VerificationPayload {
  sessionId: string;
  address: string;
  chainId: number;
  verifiedAt: string;
  issuedAt: string;
  expiresAt: string;
}

export class VerificationSecretUnavailableError extends Error {
  constructor(message = 'verification_secret_unavailable') {
    super(message);
    this.name = 'VerificationSecretUnavailableError';
  }
}

export function getSecretByteLength(secret: string): number {
  if (/^[0-9a-f]{64,}$/i.test(secret)) {
    return secret.length / 2;
  }
  try {
    const decoded = Buffer.from(secret, 'base64');
    if (decoded.length >= 32) return decoded.length;
  } catch {
    // fall through to utf8 length
  }
  return Buffer.byteLength(secret, 'utf8');
}

export function getVerificationSecret(): string {
  const secret = process.env.WALLET_VERIFICATION_SECRET?.trim();

  if (isProductionRuntime()) {
    if (!secret || getSecretByteLength(secret) < 32) {
      throw new VerificationSecretUnavailableError();
    }
    return secret;
  }

  if (secret && getSecretByteLength(secret) >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return DEV_TEST_SECRET;
  }

  if (process.env.NODE_ENV === 'development') {
    return DEV_TEST_SECRET;
  }

  throw new VerificationSecretUnavailableError();
}

function canonicalPayloadString(payload: VerificationPayload): string {
  return JSON.stringify({
    sessionId: payload.sessionId,
    address: payload.address.toLowerCase(),
    chainId: payload.chainId,
    verifiedAt: payload.verifiedAt,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt,
  });
}

function signPayload(payload: VerificationPayload, secret: string): string {
  return createHmac('sha256', secret).update(canonicalPayloadString(payload)).digest('hex');
}

export function createVerificationPayload(params: {
  address: string;
  chainId: number;
  verifiedAt: string;
  maxAgeSeconds?: number;
}): VerificationPayload {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + (params.maxAgeSeconds ?? MAX_AGE_SECONDS) * 1000);

  return {
    sessionId: randomUUID(),
    address: normalizeAddress(params.address),
    chainId: params.chainId,
    verifiedAt: params.verifiedAt,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function createVerificationCookieValue(
  payload: VerificationPayload,
  secretOverride?: string,
): string {
  const secret = secretOverride ?? getVerificationSecret();
  const signature = signPayload(payload, secret);
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

export function parseVerificationCookieValue(
  value: string | undefined,
  options?: { secretOverride?: string; now?: Date },
): VerificationPayload | null {
  if (!value) return null;

  try {
    const secret = options?.secretOverride ?? getVerificationSecret();
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      payload: VerificationPayload;
      signature: string;
    };

    const expected = signPayload(decoded.payload, secret);
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(decoded.signature, 'hex');

    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

    const now = options?.now ?? new Date();
    if (new Date(decoded.payload.expiresAt).getTime() <= now.getTime()) {
      return null;
    }

    return decoded.payload;
  } catch {
    return null;
  }
}

export async function getVerificationFromCookie(): Promise<VerificationPayload | null> {
  const store = await cookies();
  return parseVerificationCookieValue(store.get(COOKIE_NAME)?.value);
}

export function buildVerificationCookieHeader(payload: VerificationPayload): string {
  const value = createVerificationCookieValue(payload);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = Math.max(
    1,
    Math.floor((new Date(payload.expiresAt).getTime() - Date.now()) / 1000),
  );
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function canReadVerificationStatus(
  requestedAddress: string,
  cookiePayload: VerificationPayload | null,
  authenticatedUserWalletAddresses: string[],
): boolean {
  const normalized = normalizeAddress(requestedAddress).toLowerCase();

  if (cookiePayload && cookiePayload.address.toLowerCase() === normalized) {
    return true;
  }

  return authenticatedUserWalletAddresses.some((address) => address.toLowerCase() === normalized);
}
