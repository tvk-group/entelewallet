import { NextRequest, NextResponse } from 'next/server';
import { createSiweMessage, generateNonce, getSiweMessageString } from '@entelewallet/wallet-core';
import { SIWE_STATEMENT } from '@entelewallet/security';
import { CANONICAL_APP_DOMAIN, CANONICAL_APP_URL } from '@entelewallet/config';
import { normalizeAddress } from '@entelewallet/utils';
import { z } from 'zod';
import { nonceStore, cleanExpiredNonces } from '@/lib/nonce-store';

const schema = z.object({
  address: z.string(),
  chainId: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, chainId } = schema.parse(body);
    const normalized = normalizeAddress(address);
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000);
    const domain = CANONICAL_APP_DOMAIN;

    const siweMessage = createSiweMessage({
      address: normalized,
      chainId,
      nonce,
      domain,
      uri: CANONICAL_APP_URL,
      statement: SIWE_STATEMENT,
      expirationTime: expiresAt,
    });

    const message = getSiweMessageString(siweMessage);

    nonceStore.set(`${normalized.toLowerCase()}-${nonce}`, {
      nonce,
      expiresAt,
      used: false,
      chainId,
      domain,
    });

    cleanExpiredNonces();

    return NextResponse.json({ message, nonce, expiresAt: expiresAt.toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 },
    );
  }
}
