import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { proxyEntelekron } from '@/lib/entelekron-proxy';
import {
  getActiveConnectionForAddress,
  hasRecentVerification,
  linkWalletToUser,
  recordAuthEvent,
  unlinkWalletForUser,
} from '@/lib/wallet-connections-server';
import { isSupabaseAdminConfigured } from '@/lib/supabase/admin';
import { normalizeAddress } from '@entelewallet/utils';

const linkSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  walletType: z.string().optional(),
});

const unlinkSchema = z.object({
  address: z.string(),
});

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'sign_in_required' }, { status: 401 });
  }

  try {
    const body = linkSchema.parse(await request.json());
    const normalized = normalizeAddress(body.address);

    const existing = await getActiveConnectionForAddress(normalized);
    if (existing?.userId && existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'wallet_linked_to_other_account' },
        { status: 409 },
      );
    }

    const recentlyVerified = await hasRecentVerification(normalized);
    if (!recentlyVerified) {
      return NextResponse.json({ success: false, error: 'verification_required' }, { status: 400 });
    }

    const connection = await linkWalletToUser({
      userId: user.id,
      walletAddress: normalized,
      chainId: body.chainId,
      walletType: body.walletType,
    });

    await recordAuthEvent({
      userId: user.id,
      walletAddress: normalized,
      chainId: body.chainId,
      eventType: 'wallet_linked',
    });

    // Best-effort sync to EnteleKRON investor platform
    try {
      const entRes = await proxyEntelekron('/api/wallet/link', request, {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: normalized,
          chainId: body.chainId,
          walletType: body.walletType,
        }),
      });
      if (!entRes.ok && entRes.status !== 404) {
        console.warn('[wallet/link] EnteleKRON sync status:', entRes.status);
      }
    } catch {
      console.warn('[wallet/link] EnteleKRON sync unavailable');
    }

    return NextResponse.json({ success: true, connection });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'link_failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ success: false, error: 'supabase_not_configured' }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'sign_in_required' }, { status: 401 });
  }

  try {
    const body = unlinkSchema.parse(await request.json());
    const normalized = normalizeAddress(body.address);

    await unlinkWalletForUser(user.id, normalized);

    await recordAuthEvent({
      userId: user.id,
      walletAddress: normalized,
      chainId: 0,
      eventType: 'wallet_unlinked',
    });

    try {
      await proxyEntelekron('/api/wallet/link', request, {
        method: 'DELETE',
        body: JSON.stringify({ walletAddress: normalized }),
      });
    } catch {
      /* optional upstream */
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unlink_failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
