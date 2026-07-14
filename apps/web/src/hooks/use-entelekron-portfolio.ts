'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { getDisplayNetworkById } from '@entelewallet/config';
import type { PortfolioAsset, PortfolioResponse, EcosystemAsset } from '@entelewallet/types';
import { EntelekronApiError, fetchPortfolio } from '@/lib/entelekron-api';
import { readPortfolioPreferences, writePortfolioPreferences } from '@/lib/portfolio-preferences';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { getTokenUsdValue, useTokenPrices } from '@/hooks/use-token-prices';
import { useNetworkView } from '@/lib/network-view-context';
import type { TokenConfig } from '@entelewallet/types';

function tokenToPortfolioAsset(
  token: TokenConfig,
  networkId: string,
  balance: bigint | undefined,
  priceUsd: number | undefined,
  valueUsd: number | undefined,
): PortfolioAsset {
  const hasBalance = balance !== undefined && balance > 0n;
  return {
    id: `${networkId}-${token.symbol}-${token.contractAddress ?? 'native'}`,
    symbol: token.symbol,
    name: token.name,
    network: token.network,
    networkId,
    chainId: token.chainId,
    contractAddress: token.contractAddress,
    decimals: token.decimals,
    logo: token.logo,
    coingeckoId: token.coingeckoId,
    priceUsd,
    balance: balance?.toString(),
    valueUsd,
    hasBalance,
    fiatQuotePolicy: token.fiatQuotePolicy,
    source: 'configured',
    pendingOfficialConfiguration: token.pendingOfficialConfiguration,
  };
}

function buildLocalPortfolio(
  address: string,
  networkViewId: string,
  tokens: TokenConfig[],
  nativeValue: bigint | undefined,
  erc20Balances: Map<string, bigint>,
  prices: Record<string, number>,
): Pick<PortfolioResponse, 'holdings' | 'marketCatalog' | 'ecosystem'> {
  const holdings: PortfolioAsset[] = [];
  const marketCatalog: PortfolioAsset[] = [];
  const ecosystem: EcosystemAsset[] = [];

  for (const token of tokens) {
    const balance = token.isNative ? nativeValue : erc20Balances.get(token.symbol);
    const valueUsd = getTokenUsdValue(token, balance, prices);
    const coingeckoId = token.coingeckoId;
    const priceUsd =
      coingeckoId && prices[coingeckoId] !== undefined ? prices[coingeckoId] : undefined;

    const asset = tokenToPortfolioAsset(token, networkViewId, balance, priceUsd, valueUsd);
    marketCatalog.push(asset);
    if (asset.hasBalance) {
      holdings.push(asset);
    }

    if (['ENK', 'SOVRA', 'ENM'].includes(token.symbol)) {
      ecosystem.push({
        symbol: token.symbol as 'ENK' | 'SOVRA' | 'ENM',
        name: token.name,
        balance: balance?.toString(),
        valueUsd,
        vestingLinked: false,
        logo: token.logo,
        pendingOfficialConfiguration: token.pendingOfficialConfiguration,
      });
    }
  }

  holdings.sort((a, b) => {
    const aVal = a.valueUsd ?? 0;
    const bVal = b.valueUsd ?? 0;
    if (bVal !== aVal) return bVal - aVal;
    if (a.symbol === 'ENK') return -1;
    if (b.symbol === 'ENK') return 1;
    return a.name.localeCompare(b.name);
  });

  return { holdings, marketCatalog, ecosystem };
}

export function useEntelekronPortfolio() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { networkViewId } = useNetworkView();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState(readPortfolioPreferences);

  const {
    tokens,
    nativeValue,
    erc20Balances,
    isInitialLoading,
    isRefreshing,
    hasError,
    refetch: refetchBalances,
  } = usePortfolioBalances();

  const { prices } = useTokenPrices(tokens);

  const localSlice = useMemo(() => {
    if (!address) return null;
    return buildLocalPortfolio(
      address,
      networkViewId,
      tokens,
      nativeValue,
      erc20Balances,
      prices,
    );
  }, [address, networkViewId, tokens, nativeValue, erc20Balances, prices]);

  const apiQuery = useQuery({
    queryKey: ['entelekron-portfolio', address],
    queryFn: () => fetchPortfolio(),
    enabled: !!address,
    retry: false,
    staleTime: 60_000,
  });

  const portfolio: PortfolioResponse | null = useMemo(() => {
    if (!address) return null;

    if (apiQuery.data) {
      return apiQuery.data;
    }

    if (!localSlice) return null;

    return {
      walletAddress: address,
      preferences: {
        ...preferences,
        networkViewId,
        chainId,
      },
      holdings: localSlice.holdings,
      discovered: [],
      marketCatalog: localSlice.marketCatalog,
      watchlist: [],
      ecosystem: localSlice.ecosystem,
      syncedAt: new Date().toISOString(),
    };
  }, [address, apiQuery.data, localSlice, preferences, networkViewId, chainId]);

  const isApiSynced = apiQuery.isSuccess;
  const isLoading = isInitialLoading && !portfolio?.holdings.length;

  const syncPortfolio = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['entelekron-portfolio', address] }),
      refetchBalances(),
    ]);
  }, [address, queryClient, refetchBalances]);

  const formatBalance = useCallback((asset: PortfolioAsset) => {
    if (!asset.balance) return null;
    return parseFloat(formatUnits(BigInt(asset.balance), asset.decimals)).toLocaleString(
      undefined,
      { maximumFractionDigits: 6 },
    );
  }, []);

  const updatePreferences = useCallback(
    (patch: Partial<typeof preferences>) => {
      const next = { ...preferences, ...patch, networkViewId, chainId };
      setPreferences(next);
      writePortfolioPreferences(next);
    },
    [preferences, networkViewId, chainId],
  );

  useEffect(() => {
    const view = getDisplayNetworkById(networkViewId);
    if (view && view.chainId !== preferences.chainId) {
      setPreferences((prev) => {
        const next = {
          ...prev,
          chainId: view.chainId,
          networkViewId,
        };
        writePortfolioPreferences(next);
        return next;
      });
    }
  }, [networkViewId, preferences.chainId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setPreferences(readPortfolioPreferences());
  }, []);

  const holdingsWithBalance = useMemo(
    () => portfolio?.holdings.filter((h) => h.hasBalance) ?? [],
    [portfolio?.holdings],
  );

  const marketWithoutHoldings = useMemo(() => {
    const catalog = portfolio?.marketCatalog ?? [];
    if (preferences.displayMode === 'all-market') {
      return catalog;
    }
    const holdingIds = new Set(holdingsWithBalance.map((h) => h.id));
    return catalog.filter((item) => !holdingIds.has(item.id));
  }, [portfolio?.marketCatalog, holdingsWithBalance, preferences.displayMode]);

  const totalUsd = useMemo(() => {
    let total = 0;
    let hasQuoted = false;
    let hasUnlistedBalance = false;

    for (const asset of portfolio?.holdings ?? []) {
      if (asset.hasBalance && asset.fiatQuotePolicy === 'none') {
        hasUnlistedBalance = true;
      }
      if (asset.valueUsd !== undefined) {
        total += asset.valueUsd;
        hasQuoted = true;
      }
    }

    return {
      totalUsd: hasQuoted ? total : undefined,
      hasUnlistedBalance,
      isPartialTotal: hasUnlistedBalance && hasQuoted,
    };
  }, [portfolio?.holdings]);

  return {
    portfolio,
    preferences,
    updatePreferences,
    holdingsWithBalance,
    marketWithoutHoldings,
    discovered: portfolio?.discovered ?? [],
    ecosystem: portfolio?.ecosystem ?? [],
    totalUsd,
    isLoading,
    isRefreshing,
    hasError: hasError || (apiQuery.isError && !(apiQuery.error instanceof EntelekronApiError && apiQuery.error.status === 401)),
    isApiSynced,
    apiUnavailable: apiQuery.isError,
    syncPortfolio,
    formatBalance,
  };
}
