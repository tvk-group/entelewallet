import { NextRequest, NextResponse } from 'next/server';
import { createSiweMessage, generateNonce, getSiweMessageString } from '@entelewallet/wallet-core';
import { SIWE_STATEMENT } from '@entelewallet/security';
import { normalizeAddress } from '@entelewallet/utils';
import { z } from 'zod';
import { resolveSiweOrigin } from '@/lib/siwe-request';
import { storeWalletNonce } from '@/lib/wallet-nonce-server';

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
    const host = request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto');
    const { domain, uri } = resolveSiweOrigin(host, proto);

    const siweMessage = createSiweMessage({
      address: normalized,
      chainId,
      nonce,
      domain,
      uri,
      statement: SIWE_STATEMENT,
      expirationTime: expiresAt,
    });

    const message = getSiweMessageString(siweMessage);

    await storeWalletNonce({
      walletAddress: normalized,
      chainId,
      nonce,
      message,
      domain,
      expiresAt,
    });

    return NextResponse.json({ message, nonce, expiresAt: expiresAt.toISOString(), domain });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 },
    );
  }
}
