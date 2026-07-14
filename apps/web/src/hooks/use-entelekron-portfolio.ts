'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount, useChainId } from 'wagmi';
import { getDisplayNetworkById } from '@entelewallet/config';
import type { PortfolioAsset, PortfolioResponse, EcosystemAsset } from '@entelewallet/types';
import { EntelekronApiError, fetchPortfolio } from '@/lib/entelekron-api';
import { formatAssetBalance } from '@/lib/multi-chain-balances';
import { readPortfolioPreferences } from '@/lib/portfolio-preferences';
import { loadSyncedPreferences, patchLocalPreferences } from '@/lib/wallet-preferences-sync';
import { setNetworkViewIdStore } from '@/lib/network-view-store';
import { usePortfolioBalances } from '@/hooks/use-portfolio-balances';
import { useMultiChainPortfolio } from '@/hooks/use-multi-chain-portfolio';
import { useDiscoveredTokens } from '@/hooks/use-discovered-tokens';
import { useLinkedAddresses } from '@/hooks/use-linked-addresses';
import { getAssetUsdValue, getTokenUsdValue, useDiscoveredAssetPrices, useTokenPrices } from '@/hooks/use-token-prices';
import { useNetworkView } from '@/lib/network-view-context';
import { useWalletStatus } from '@/lib/wallet-context';
import type { TokenConfig } from '@entelewallet/types';
import type { WalletPreferences } from '@entelewallet/types';

function buildActiveNetworkSlice(
  networkViewId: string,
  tokens: TokenConfig[],
  nativeValue: bigint | undefined,
  erc20Balances: Map<string, bigint>,
  prices: Record<string, number>,
  vestingLinked: boolean,
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
    const hasBalance = balance !== undefined && balance > 0n;

    const asset: PortfolioAsset = {
      id: `${networkViewId}-${token.symbol}-${token.contractAddress ?? 'native'}`,
      symbol: token.symbol,
      name: token.name,
      network: token.network,
      networkId: networkViewId,
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

    marketCatalog.push(asset);
    if (hasBalance) holdings.push(asset);

    if (['ENK', 'SOVRA', 'ENM'].includes(token.symbol)) {
      ecosystem.push({
        symbol: token.symbol as 'ENK' | 'SOVRA' | 'ENM',
        name: token.name,
        balance: balance?.toString(),
        valueUsd,
        vestingLinked,
        logo: token.logo,
        pendingOfficialConfiguration: token.pendingOfficialConfiguration,
      });
    }
  }

  return { holdings, marketCatalog, ecosystem };
}

export function useEntelekronPortfolio() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { networkViewId } = useNetworkView();
  const { isLinkedToAccount } = useWalletStatus();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<WalletPreferences | null>(() =>
    typeof window !== 'undefined' ? readPortfolioPreferences() : null,
  );

  const {
    tokens,
    nativeValue,
    erc20Balances,
    isInitialLoading,
    isRefreshing: activeRefreshing,
    hasError,
    refetch: refetchActiveBalances,
  } = usePortfolioBalances();

  const { prices } = useTokenPrices(tokens);

  const {
    holdings: crossChainHoldings,
    breakdown: networkBreakdown,
    crossChainTotalUsd,
    isFetching: multiChainFetching,
    refetch: refetchMultiChain,
  } = useMultiChainPortfolio();

  const autoDiscoverEnabled = preferences?.autoDiscoverEnabled ?? true;
  const {
    discovered: discoveredTokens,
    isLoading: discoveredLoading,
    isFetching: discoveredFetching,
    dismissToken,
    refetch: refetchDiscovered,
  } = useDiscoveredTokens(autoDiscoverEnabled);

  const { prices: discoveredPrices } = useDiscoveredAssetPrices(discoveredTokens);

  const pricedDiscovered = useMemo(
    () =>
      discoveredTokens.map((asset) => {
        const valueUsd = getAssetUsdValue(asset, discoveredPrices);
        return valueUsd !== undefined ? { ...asset, valueUsd } : asset;
      }),
    [discoveredTokens, discoveredPrices],
  );

  const {
    balances: nonEvmBalances,
    isLoading: nonEvmLoading,
    refetch: refetchNonEvm,
  } = useLinkedAddresses();

  const activeSlice = useMemo(() => {
    if (!address) return null;
    return buildActiveNetworkSlice(
      networkViewId,
      tokens,
      nativeValue,
      erc20Balances,
      prices,
      isLinkedToAccount,
    );
  }, [address, networkViewId, tokens, nativeValue, erc20Balances, prices, isLinkedToAccount]);

  const apiQuery = useQuery({
    queryKey: ['entelekron-portfolio', address],
    queryFn: () => fetchPortfolio(),
    enabled: !!address,
    retry: false,
    staleTime: 60_000,
  });

  const nonEvmHoldings: PortfolioAsset[] = useMemo(
    () =>
      nonEvmBalances.map((row) => ({
        id: `non-evm-${row.networkId}-${row.address}`,
        symbol: row.symbol,
        name: row.symbol === 'SUI' ? 'Sui' : 'Cardano',
        network: row.networkId === 'sui' ? 'Sui' : 'Cardano',
        networkId: row.networkId,
        decimals: row.decimals,
        balance: row.balance,
        valueUsd: row.valueUsd,
        hasBalance: true,
        source: 'configured' as const,
        fiatQuotePolicy: 'market' as const,
      })),
    [nonEvmBalances],
  );

  const mergedHoldings = useMemo(() => {
    if (apiQuery.data?.holdings?.length) {
      return apiQuery.data.holdings.filter((h) => h.hasBalance);
    }

    const map = new Map<string, PortfolioAsset>();
    for (const asset of crossChainHoldings) {
      if (asset.hasBalance) map.set(asset.id, asset);
    }
    for (const asset of nonEvmHoldings) {
      map.set(asset.id, asset);
    }
    return [...map.values()].sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
  }, [apiQuery.data, crossChainHoldings, nonEvmHoldings]);

  const portfolio: PortfolioResponse | null = useMemo(() => {
    if (!address || !preferences) return null;

    if (apiQuery.data) {
      return {
        ...apiQuery.data,
        discovered: apiQuery.data.discovered ?? pricedDiscovered,
        networkBreakdown: apiQuery.data.networkBreakdown ?? networkBreakdown,
        crossChainTotalUsd: apiQuery.data.crossChainTotalUsd ?? crossChainTotalUsd,
        ecosystem: (apiQuery.data.ecosystem ?? []).map((asset) => ({
          ...asset,
          vestingLinked: isLinkedToAccount || asset.vestingLinked,
        })),
      };
    }

    const holdings = mergedHoldings;
    const marketCatalog = activeSlice?.marketCatalog ?? [];

    return {
      walletAddress: address,
      preferences: { ...preferences, networkViewId, chainId },
      holdings,
      discovered: pricedDiscovered,
      marketCatalog,
      watchlist: [],
      ecosystem: activeSlice?.ecosystem ?? [],
      syncedAt: new Date().toISOString(),
      networkBreakdown,
      crossChainTotalUsd,
    };
  }, [
    address,
    preferences,
    apiQuery.data,
    pricedDiscovered,
    networkBreakdown,
    crossChainTotalUsd,
    mergedHoldings,
    activeSlice,
    networkViewId,
    chainId,
    isLinkedToAccount,
  ]);

  const isLoading =
    (isInitialLoading && !portfolio?.holdings.length) ||
    discoveredLoading ||
    nonEvmLoading;

  const isRefreshing =
    activeRefreshing || multiChainFetching || discoveredFetching;

  const syncPortfolio = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['entelekron-portfolio', address] }),
      refetchActiveBalances(),
      refetchMultiChain(),
      refetchDiscovered(),
      refetchNonEvm(),
    ]);
  }, [
    address,
    queryClient,
    refetchActiveBalances,
    refetchDiscovered,
    refetchMultiChain,
    refetchNonEvm,
  ]);

  const updatePreferences = useCallback(
    async (patch: Partial<WalletPreferences>) => {
      const view = getDisplayNetworkById(networkViewId);
      const viewChainId = view?.chainId ?? chainId;
      const next = await patchLocalPreferences({
        ...patch,
        networkViewId,
        chainId: viewChainId,
      });
      setPreferences(next);
    },
    [networkViewId, chainId],
  );

  useEffect(() => {
    void loadSyncedPreferences().then((prefs) => {
      setPreferences(prefs);
      if (prefs.networkViewId && getDisplayNetworkById(prefs.networkViewId)) {
        setNetworkViewIdStore(prefs.networkViewId);
      }
    });
  }, []);

  useEffect(() => {
    const view = getDisplayNetworkById(networkViewId);
    if (!view || !preferences) return;
    if (view.chainId !== preferences.chainId || networkViewId !== preferences.networkViewId) {
      void patchLocalPreferences({
        chainId: view.chainId,
        networkViewId,
      }).then(setPreferences);
    }
  }, [networkViewId, preferences]);

  const holdingsWithBalance = useMemo(
    () => portfolio?.holdings.filter((h) => h.hasBalance) ?? [],
    [portfolio?.holdings],
  );

  const marketWithoutHoldings = useMemo(() => {
    const catalog = portfolio?.marketCatalog ?? [];
    const mode = preferences?.displayMode ?? 'holdings-first';
    if (mode === 'all-market') return catalog;
    const holdingIds = new Set(holdingsWithBalance.map((h) => h.id));
    return catalog.filter((item) => !holdingIds.has(item.id));
  }, [portfolio?.marketCatalog, holdingsWithBalance, preferences?.displayMode]);

  const totalUsd = useMemo(() => {
    if (crossChainTotalUsd !== undefined) {
      const nonEvmTotal = nonEvmHoldings.reduce((sum, row) => sum + (row.valueUsd ?? 0), 0);
      const hasNonEvm = nonEvmHoldings.some((row) => row.valueUsd !== undefined);
      const base = crossChainTotalUsd + nonEvmTotal;
      return {
        totalUsd: hasNonEvm || crossChainTotalUsd > 0 ? base : crossChainTotalUsd,
        hasUnlistedBalance: holdingsWithBalance.some((a) => a.fiatQuotePolicy === 'none'),
        isPartialTotal: holdingsWithBalance.some((a) => a.fiatQuotePolicy === 'none'),
      };
    }

    let total = 0;
    let hasQuoted = false;
    let hasUnlistedBalance = false;
    for (const asset of holdingsWithBalance) {
      if (asset.fiatQuotePolicy === 'none') hasUnlistedBalance = true;
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
  }, [crossChainTotalUsd, nonEvmHoldings, holdingsWithBalance]);

  if (!preferences) {
    return {
      portfolio: null,
      preferences: null,
      updatePreferences,
      holdingsWithBalance: [],
      marketWithoutHoldings: [],
      discovered: [],
      ecosystem: [],
      networkBreakdown: [],
      totalUsd: { totalUsd: undefined, hasUnlistedBalance: false, isPartialTotal: false },
      isLoading: true,
      isRefreshing: false,
      hasError: false,
      isApiSynced: false,
      apiUnavailable: false,
      syncPortfolio,
      formatBalance: formatAssetBalance,
      dismissDiscoveredToken: dismissToken,
    };
  }

  return {
    portfolio,
    preferences,
    updatePreferences,
    holdingsWithBalance,
    marketWithoutHoldings,
    discovered: portfolio?.discovered ?? [],
    ecosystem: portfolio?.ecosystem ?? [],
    networkBreakdown: portfolio?.networkBreakdown ?? [],
    totalUsd,
    isLoading,
    isRefreshing,
    hasError:
      hasError ||
      (apiQuery.isError &&
        !(apiQuery.error instanceof EntelekronApiError && apiQuery.error.status === 401)),
    isApiSynced: apiQuery.isSuccess,
    apiUnavailable: apiQuery.isError,
    syncPortfolio,
    formatBalance: formatAssetBalance,
    dismissDiscoveredToken: dismissToken,
  };
}
