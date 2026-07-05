'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@entelewallet/config';
import { Button } from '@entelewallet/ui';
import { WalletErrorFallback } from '@/components/wallet-error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[EnteleWALLET route error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="space-y-4">
        <WalletErrorFallback />
        <div className="text-center">
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Try again
          </Button>
          <Link href={ROUTES.home} className="ml-3 text-sm text-cyan-700 hover:underline">
            Go home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mx-auto max-w-xl overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
