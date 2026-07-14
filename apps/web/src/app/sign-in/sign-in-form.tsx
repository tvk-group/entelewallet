'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { CANONICAL_APP_URL, ROUTES, websiteUrl } from '@entelewallet/config';
import { Button, Card, CardContent, Alert } from '@entelewallet/ui';
import { createClient } from '@/lib/supabase/client';
import { ExternalLink } from 'lucide-react';

export default function SignInForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';
  const callbackError = searchParams.get('error') === 'auth_callback_failed';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabaseConfigured) {
      setStatus('error');
      setErrorMessage(t('auth.supabaseNotConfigured'));
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    const supabase = createClient();
    const redirectTo = `${CANONICAL_APP_URL.replace(/\/$/, '')}${ROUTES.authCallback}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: isSignup,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('sent');
  }

  return (
    <PageLayout
      title={isSignup ? t('common.createAccount') : t('common.signIn')}
      description={t('auth.signInDescription')}
    >
      <div className="mx-auto max-w-md space-y-6">
        {callbackError && <Alert variant="error">{t('auth.callbackError')}</Alert>}

        {!supabaseConfigured && (
          <Alert variant="warning">{t('auth.supabaseNotConfigured')}</Alert>
        )}

        <Card>
          <CardContent className="space-y-4 p-6">
            {status === 'sent' ? (
              <Alert variant="info">{t('auth.checkEmail')}</Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                    {t('auth.emailLabel')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!supabaseConfigured || status === 'loading'}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!supabaseConfigured || status === 'loading'}
                >
                  {status === 'loading' ? t('common.loading') : t('auth.sendMagicLink')}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-slate-600">
              {isSignup ? (
                <>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link href={ROUTES.signIn} className="font-medium text-cyan-700 hover:text-cyan-900">
                    {t('common.signIn')}
                  </Link>
                </>
              ) : (
                <>
                  {t('auth.newAccount')}{' '}
                  <Link
                    href={`${ROUTES.signIn}?mode=signup`}
                    className="font-medium text-cyan-700 hover:text-cyan-900"
                  >
                    {t('common.createAccount')}
                  </Link>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          <a
            href={websiteUrl('home')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-cyan-700 hover:text-cyan-900"
          >
            {t('auth.visitWebsite')} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
