'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@entelewallet/config';
import { useEntelekronPortfolio } from '@/hooks/use-entelekron-portfolio';
import { useWatchlist } from '@/hooks/use-watchlist';

/**
 * Handles deep link: ?source=entelekron&view=wallet&sync=portfolio
 */
export function PortfolioSyncHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { syncPortfolio } = useEntelekronPortfolio();
  const { refresh: refreshWatchlist } = useWatchlist();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const source = searchParams.get('source');
    const view = searchParams.get('view');
    const sync = searchParams.get('sync');

    if (source !== 'entelekron' || view !== 'wallet') return;

    handled.current = true;

    if (window.location.pathname !== ROUTES.assets) {
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`${ROUTES.assets}?${params.toString()}`);
      return;
    }

    if (sync === 'portfolio') {
      void syncPortfolio();
      void refreshWatchlist();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('sync');
    const query = params.toString();
    router.replace(query ? `${ROUTES.assets}?${query}` : ROUTES.assets);
  }, [searchParams, router, syncPortfolio, refreshWatchlist]);

  return null;
}
