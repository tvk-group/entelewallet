'use client';

import { useEffect } from 'react';
import { WalletErrorFallback } from '@/components/wallet-error-boundary';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[EnteleWALLET global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="space-y-4">
            <WalletErrorFallback />
            <div className="text-center">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mx-auto max-w-xl overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 shadow">
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
