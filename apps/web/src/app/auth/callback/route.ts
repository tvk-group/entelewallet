import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CANONICAL_APP_URL, ROUTES } from '@entelewallet/config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? ROUTES.account;

  const appOrigin = CANONICAL_APP_URL.replace(/\/$/, '');
  const redirectBase = origin.includes('localhost') ? origin : appOrigin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }
  }

  return NextResponse.redirect(
    `${redirectBase}${ROUTES.signIn}?error=auth_callback_failed`,
  );
}
