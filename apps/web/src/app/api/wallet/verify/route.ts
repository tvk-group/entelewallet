import { NextRequest, NextResponse } from 'next/server';
import {
  validateExactStoredMessage,
  validateSiweExpectations,
  verifySiweMessage,
} from '@entelewallet/wallet-core';
import { normalizeAddress, hashString, redactAddress } from '@entelewallet/utils';
import { isProductionRuntime } from '@entelewallet/config';
import { z } from 'zod';
import { consumeWalletNonce, NonceStorageUnavailableError } from '@/lib/wallet-nonce-server';
import {
  recordAuthEvent,
  getLatestVerification,
  getUserConnections,
} from '@/lib/wallet-connections-server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import {
  getClientIp,
  readWalletApiBody,
  SAFE_NONCE_UNAVAILABLE_ERROR,
  SAFE_WALLET_API_ERROR,
  validateWalletApiOrigin,
} from '@/lib/siwe-api-security';
import { enforceWalletApiRateLimit } from '@/lib/rate-limit';
import {
  buildVerificationCookieHeader,
  canReadVerificationStatus,
  getVerificationFromCookie,
} from '@/lib/verification-session';

const schema = z.object({
  message: z.string(),
  signature: z.string(),
  address: z.string(),
  chainId: z.number(),
});

export async function POST(request: NextRequest) {
  if (!validateWalletApiOrigin(request)) {
    return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 403 });
  }

  const rawBody = await readWalletApiBody(request);
  if (rawBody === null) {
    return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 413 });
  }

  try {
    const body = schema.parse(JSON.parse(rawBody));
    const normalized = normalizeAddress(body.address);

    const rateLimit = enforceWalletApiRateLimit({
      scope: 'verify',
      ip: getClientIp(request),
      walletAddress: normalized,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: SAFE_WALLET_API_ERROR },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds
            ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
            : undefined,
        },
      );
    }

    const nonceMatch = body.message.match(/Nonce: ([a-f0-9]+)/i);
    if (!nonceMatch) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }
    const nonce = nonceMatch[1]!;

    const stored = await consumeWalletNonce(normalized, nonce);
    if (!stored) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    const exactMatch = validateExactStoredMessage(body.message, stored.message);
    if (!exactMatch.success) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    const fieldCheck = validateSiweExpectations(body.message, {
      domain: stored.domain,
      uri: stored.uri,
      nonce,
      chainId: stored.chainId,
      address: normalized,
    });
    if (!fieldCheck.success) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    const result = await verifySiweMessage(body.message, body.signature, stored.domain, nonce);
    if (!result.success) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    if (result.address?.toLowerCase() !== normalized.toLowerCase()) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    if (result.chainId !== body.chainId || result.chainId !== stored.chainId) {
      return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const verifiedAt = new Date().toISOString();

    let userId: string | undefined;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {
        // Optional auth context — verification can proceed without Supabase session.
      }
    }

    await recordAuthEvent({
      userId,
      walletAddress: normalized,
      chainId: body.chainId,
      eventType: 'verification_success',
      ipHash: hashString(ip),
      userAgentHash: hashString(userAgent),
    });

    if (isProductionRuntime()) {
      console.info('[wallet_auth_event]', {
        event_type: 'verification_success',
        wallet_address: redactAddress(normalized),
        chain_id: body.chainId,
        domain: stored.domain,
        ip_hash: hashString(ip),
        timestamp: verifiedAt,
      });
    } else {
      console.info('[wallet_auth_event]', {
        event_type: 'verification_success',
        wallet_address: normalized,
        chain_id: body.chainId,
        domain: stored.domain,
        ip_hash: hashString(ip),
        user_agent_hash: hashString(userAgent),
        timestamp: verifiedAt,
      });
    }

    const response = NextResponse.json({
      success: true,
      address: normalized,
      chainId: body.chainId,
      verifiedAt,
    });

    response.headers.set(
      'Set-Cookie',
      buildVerificationCookieHeader({
        address: normalized,
        chainId: body.chainId,
        verifiedAt,
      }),
    );

    return response;
  } catch (err) {
    if (err instanceof NonceStorageUnavailableError) {
      return NextResponse.json(
        { success: false, error: SAFE_NONCE_UNAVAILABLE_ERROR },
        { status: 503 },
      );
    }
    return NextResponse.json({ success: false, error: SAFE_WALLET_API_ERROR }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 400 });
  }

  let normalized: string;
  try {
    normalized = normalizeAddress(address);
  } catch {
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 400 });
  }

  const cookiePayload = await getVerificationFromCookie();

  let linkedAddresses: string[] = [];
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        linkedAddresses = (await getUserConnections(user.id)).map(
          (connection) => connection.walletAddress,
        );
      }
    } catch {
      // Supabase unavailable — cookie-only verification status reads.
    }
  }

  if (!canReadVerificationStatus(normalized, cookiePayload, linkedAddresses)) {
    return NextResponse.json({ error: SAFE_WALLET_API_ERROR }, { status: 403 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      verified: Boolean(cookiePayload),
      verifiedAt: cookiePayload?.verifiedAt,
      chainId: cookiePayload?.chainId,
    });
  }

  const latest = await getLatestVerification(normalized);

  return NextResponse.json({
    verified: Boolean(latest),
    verifiedAt: latest?.verifiedAt,
    chainId: latest?.chainId,
  });
}
