'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ROUTES } from '@entelewallet/config';
import { usePwa } from '@/lib/pwa-context';

/**
 * Installed PWA users skip the marketing home and land in the wallet shell.
 */
export function PwaHomeRedirect({ children }: { children: ReactNode }) {
  const { isStandalone } = usePwa();
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isStandalone) return;
    router.replace(isConnected ? ROUTES.overview : ROUTES.connect);
  }, [isStandalone, isConnected, router]);

  if (isStandalone) {
    return null;
  }

  return <>{children}</>;
}
