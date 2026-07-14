import { NextResponse } from 'next/server';
import { proxyEntelekron } from '@/lib/entelekron-proxy';

export async function GET(request: Request) {
  try {
    const res = await proxyEntelekron('/api/user/wallet-preferences', request);
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
    return NextResponse.json({ error: 'unauthenticated' }, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'upstream_unavailable' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const body = await request.json();

  try {
    const res = await proxyEntelekron('/api/user/wallet-preferences', request, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    /* fall through to local echo */
  }

  return NextResponse.json(body);
}
