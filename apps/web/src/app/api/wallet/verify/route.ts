import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage } from '@entelewallet/wallet-core';
import { normalizeAddress, hashString } from '@entelewallet/utils';
import { z } from 'zod';
import { consumeWalletNonce } from '@/lib/wallet-nonce-server';
import { recordAuthEvent, getLatestVerification } from '@/lib/wallet-connections-server';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  message: z.string(),
  signature: z.string(),
  address: z.string(),
  chainId: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, address, chainId } = schema.parse(body);
    const normalized = normalizeAddress(address);

    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/i);
    if (!nonceMatch) {
      return NextResponse.json({ success: false, error: 'Invalid message format' }, { status: 400 });
    }
    const nonce = nonceMatch[1]!;

    const stored = await consumeWalletNonce(normalized, nonce);
    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'Nonce not found or expired. Please try again.' },
        { status: 400 },
      );
    }

    const result = await verifySiweMessage(message, signature, stored.domain, nonce);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    if (result.address?.toLowerCase() !== normalized.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Address mismatch' }, { status: 400 });
    }

    if (result.chainId !== chainId) {
      return NextResponse.json({ success: false, error: 'Chain ID mismatch' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const verifiedAt = new Date().toISOString();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const persisted = await recordAuthEvent({
      userId: user?.id,
      walletAddress: normalized,
      chainId,
      eventType: 'verification_success',
      ipHash: hashString(ip),
      userAgentHash: hashString(userAgent),
    });

    if (!persisted) {
      console.warn('[wallet_auth_event] verification_success not persisted to Supabase');
    }

    console.info('[wallet_auth_event]', {
      event_type: 'verification_success',
      wallet_address: normalized,
      chain_id: chainId,
      domain: stored.domain,
      ip_hash: hashString(ip),
      user_agent_hash: hashString(userAgent),
      timestamp: verifiedAt,
    });

    return NextResponse.json({
      success: true,
      address: normalized,
      chainId,
      verifiedAt,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address_required' }, { status: 400 });
  }

  const normalized = normalizeAddress(address);
  const latest = await getLatestVerification(normalized);

  return NextResponse.json({
    verified: Boolean(latest),
    verifiedAt: latest?.verifiedAt,
    chainId: latest?.chainId,
  });
}
