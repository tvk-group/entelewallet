'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import {
  ENTELEKRON_INTEGRATION_SOURCE,
  isEmbedView,
  type EmbedView,
} from '@entelewallet/config';

export interface EmbedRoutingState {
  /** Active embed view from ?view= (null = marketing landing). */
  view: EmbedView | null;
  /** True when ?source=entelekron — show return banner. */
  fromEntelekron: boolean;
  /** True when any embed view is active (skip marketing landing). */
  isEmbedMode: boolean;
}

export function useEmbedRouting(): EmbedRoutingState {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const rawView = searchParams.get('view');
    const view = isEmbedView(rawView) ? rawView : null;
    const fromEntelekron = searchParams.get('source') === ENTELEKRON_INTEGRATION_SOURCE;

    return {
      view,
      fromEntelekron,
      isEmbedMode: view != null,
    };
  }, [searchParams]);
}
