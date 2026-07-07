'use client';

import { useMemo } from 'react';
import { hasMarketQuote } from '@entelewallet/config';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { formatUsd, getTokenUsdValue, useTokenPrices } from '@/hooks/use-token-prices';

/** Total USD for listed (market-quoted) assets on the active network. */
export function usePortfolioTotalUsd() {
  const { tokens, nativeValue, erc20Balances } = usePortfolioBalances();
  const { prices } = useTokenPrices(tokens);

  return useMemo(() => {
    let total = 0;
    let hasQuoted = false;
    let hasUnlistedBalance = false;

    for (const token of tokens) {
      const balance = token.isNative ? nativeValue : erc20Balances.get(token.symbol);
      if (balance !== undefined && balance > 0n && !hasMarketQuote(token)) {
        hasUnlistedBalance = true;
      }
      const usd = getTokenUsdValue(token, balance, prices);
      if (usd !== undefined) {
        total += usd;
        hasQuoted = true;
      }
    }

    return {
      totalUsd: hasQuoted ? total : undefined,
      formatted: formatUsd(hasQuoted ? total : undefined),
      hasUnlistedBalance,
      isPartialTotal: hasUnlistedBalance && hasQuoted,
    };
  }, [tokens, nativeValue, erc20Balances, prices]);
}
