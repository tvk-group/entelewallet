import { NextResponse, type NextRequest } from 'next/server';
import { CANONICAL_APP_DOMAIN, shouldRedirectHostToCanonicalApp } from '@entelewallet/config';
import { updateSession } from '@/lib/supabase/middleware';
import { applySecurityHeaders } from '@/lib/security-headers';

function withSecurityHeaders(response: NextResponse): NextResponse {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  return applySecurityHeaders(response, isProduction) as NextResponse;
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  if (shouldRedirectHostToCanonicalApp(host)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_APP_DOMAIN;
    return withSecurityHeaders(NextResponse.redirect(url, 308));
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return withSecurityHeaders(await updateSession(request));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|brand/|og/|ecosystem-animation/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)',
  ],
};
