import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { normalizeAddress } from '@entelewallet/utils';

const COOKIE_NAME = 'ew-wallet-verification';
const MAX_AGE_SECONDS = 60 * 60 * 24;

interface VerificationPayload {
  address: string;
  chainId: number;
  verifiedAt: string;
}

function getSigningSecret(): string {
  return (
    process.env.WALLET_VERIFICATION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'dev-only-verification-secret'
  );
}

function signPayload(payload: VerificationPayload): string {
  const body = JSON.stringify(payload);
  return createHmac('sha256', getSigningSecret()).update(body).digest('hex');
}

export function createVerificationCookieValue(payload: VerificationPayload): string {
  const signature = signPayload(payload);
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');
}

export function parseVerificationCookieValue(
  value: string | undefined,
): VerificationPayload | null {
  if (!value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      payload: VerificationPayload;
      signature: string;
    };

    const expected = signPayload(decoded.payload);
    const expectedBuf = Buffer.from(expected, 'hex');
    const actualBuf = Buffer.from(decoded.signature, 'hex');

    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

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
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`;
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
