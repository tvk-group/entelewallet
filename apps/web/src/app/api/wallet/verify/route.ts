import { NextRequest, NextResponse } from 'next/server';
import { verifySiweMessage } from '@entelewallet/wallet-core';
import { CANONICAL_APP_DOMAIN } from '@entelewallet/config';
import { normalizeAddress, hashString } from '@entelewallet/utils';
import { z } from 'zod';
import { nonceStore } from '@/lib/nonce-store';
import { recordAuthEvent } from '@/lib/wallet-connections-server';

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

    // Extract nonce from SIWE message
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/i);
    if (!nonceMatch) {
      return NextResponse.json({ success: false, error: 'Invalid message format' }, { status: 400 });
    }
    const nonce = nonceMatch[1];
    const storeKey = `${normalized.toLowerCase()}-${nonce}`;
    const stored = nonceStore.get(storeKey);

    if (!stored) {
      return NextResponse.json({ success: false, error: 'Nonce not found or expired' }, { status: 400 });
    }

    if (stored.used) {
      return NextResponse.json({ success: false, error: 'Nonce already used' }, { status: 400 });
    }

    if (stored.expiresAt < new Date()) {
      nonceStore.delete(storeKey);
      return NextResponse.json({ success: false, error: 'Nonce expired' }, { status: 400 });
    }

    const result = await verifySiweMessage(message, signature, CANONICAL_APP_DOMAIN, nonce);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    if (result.address?.toLowerCase() !== normalized.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Address mismatch' }, { status: 400 });
    }

    if (result.chainId !== chainId) {
      return NextResponse.json({ success: false, error: 'Chain ID mismatch' }, { status: 400 });
    }

    stored.used = true;
    nonceStore.set(storeKey, stored);

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const verifiedAt = new Date().toISOString();

    await recordAuthEvent({
      walletAddress: normalized,
      chainId,
      eventType: 'verification_success',
      ipHash: hashString(ip),
      userAgentHash: hashString(userAgent),
    });

    console.info('[wallet_auth_event]', {
      event_type: 'verification_success',
      wallet_address: normalized,
      chain_id: chainId,
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
