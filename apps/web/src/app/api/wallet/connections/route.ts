import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getActiveConnectionForAddress, getUserConnections } from '@/lib/wallet-connections-server';
import { normalizeAddress } from '@entelewallet/utils';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const connections = await getUserConnections(user.id);

  const addressParam = request.nextUrl.searchParams.get('address');
  let walletStatus:
    | {
        linkedToCurrentUser: boolean;
        linkedToOtherUser: boolean;
      }
    | undefined;

  if (addressParam) {
    const active = await getActiveConnectionForAddress(normalizeAddress(addressParam));
    walletStatus = {
      linkedToCurrentUser: active?.userId === user.id,
      linkedToOtherUser: Boolean(active?.userId && active.userId !== user.id),
    };
  }

  return NextResponse.json({ connections, walletStatus });
}
