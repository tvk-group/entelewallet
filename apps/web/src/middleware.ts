import { NextResponse, type NextRequest } from 'next/server';
import { APP_ALIAS_HOSTS, CANONICAL_APP_DOMAIN } from '@entelewallet/config';
import { updateSession } from '@/lib/supabase/middleware';

const ALIAS_HOSTS = new Set<string>(APP_ALIAS_HOSTS);

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0] ?? '';

  if (ALIAS_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_APP_DOMAIN;
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|brand/|og/|ecosystem-animation/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
};
