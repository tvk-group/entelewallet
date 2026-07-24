import { NextRequest, NextResponse } from 'next/server';
import { createSiweMessage, generateNonce, getSiweMessageString } from '@entelewallet/wallet-core';
import { SIWE_STATEMENT } from '@entelewallet/security';
import { normalizeAddress } from '@entelewallet/utils';
import { z } from 'zod';
import { resolveSiweOrigin } from '@/lib/siwe-request';
import { NonceStorageUnavailableError, storeWalletNonce } from '@/lib/wallet-nonce-server';
import {
  getClientIp,
  readWalletApiBody,
  SAFE_NONCE_UNAVAILABLE_ERROR,
  SAFE_RATE_LIMIT_UNAVAILABLE_ERROR,
  SAFE_WALLET_API_ERROR,
  validateWalletApiOrigin,
} from '@/lib/siwe-api-security';
import { enforceWalletApiRateLimit, RateLimitStorageUnavailableError } from '@/lib/rate-limit';

const schema = z.object({
  address: z.string(),
  chainId: z.number(),
});

export async function POST(request: NextRequest) {
  if (!validateWalletApiOrigin(request)) {
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 403 });
  }

  const rawBody = await readWalletApiBody(request);
  if (rawBody === null) {
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 413 });
  }

  try {
    const body = schema.parse(JSON.parse(rawBody));
    const normalized = normalizeAddress(body.address);

    const rateLimit = await enforceWalletApiRateLimit({
      scope: 'nonce',
      ip: getClientIp(request),
      walletAddress: normalized,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: SAFE_WALLET_API_ERROR },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds
            ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
            : undefined,
        },
      );
    }

    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000);
    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto');
    const { domain, uri } = resolveSiweOrigin(host, proto);

    const siweMessage = createSiweMessage({
      address: normalized,
      chainId: body.chainId,
      nonce,
      domain,
      uri,
      statement: SIWE_STATEMENT,
      expirationTime: expiresAt,
    });

    const message = getSiweMessageString(siweMessage);

    await storeWalletNonce({
      walletAddress: normalized,
      chainId: body.chainId,
      nonce,
      message,
      domain,
      uri,
      expiresAt,
    });

    return NextResponse.json({ message, nonce, expiresAt: expiresAt.toISOString(), domain });
  } catch (err) {
    if (err instanceof RateLimitStorageUnavailableError) {
      return NextResponse.json({ error: SAFE_RATE_LIMIT_UNAVAILABLE_ERROR }, { status: 503 });
    }
    if (err instanceof NonceStorageUnavailableError) {
      return NextResponse.json({ error: SAFE_NONCE_UNAVAILABLE_ERROR }, { status: 503 });
    }
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 400 });
  }
}
