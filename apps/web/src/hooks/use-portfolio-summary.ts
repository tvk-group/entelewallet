'use client';

import { useMemo } from 'react';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { formatUsd, getTokenUsdValue, useTokenPrices } from '@/hooks/use-token-prices';

/** Total USD for the active network portfolio. */
export function usePortfolioTotalUsd() {
  const { tokens, nativeValue, erc20Balances } = usePortfolioBalances();
  const { prices } = useTokenPrices(tokens);

  return useMemo(() => {
    let total = 0;
    let hasAny = false;
    for (const token of tokens) {
      const balance = token.isNative ? nativeValue : erc20Balances.get(token.symbol);
      const usd = getTokenUsdValue(token, balance, prices);
      if (usd !== undefined) {
        total += usd;
        hasAny = true;
      }
    }
    return { totalUsd: hasAny ? total : undefined, formatted: formatUsd(hasAny ? total : undefined) };
  }, [tokens, nativeValue, erc20Balances, prices]);
}
