import {
  getChainByChainId,
  getFullPortfolioChainIds,
  getTokensForChain,
  getDefaultNetworkViewId,
  resolveTokenLogo,
} from '@entelewallet/config';
import { ERC20_ABI } from '@entelewallet/blockchain';
import type { PortfolioAsset, NetworkHoldingsBreakdown } from '@entelewallet/types';
import type { TokenConfig } from '@entelewallet/types';
import { createPublicClient, http, formatUnits, type Address } from 'viem';
import { getTokenUsdValue } from '@/hooks/use-token-prices';

function clientForChain(chainId: number) {
  const chain = getChainByChainId(chainId);
  if (!chain?.rpcUrls[0]) return null;

  return createPublicClient({
    transport: http(chain.rpcUrls[0]),
  });
}

async function fetchChainBalances(
  walletAddress: Address,
  chainId: number,
): Promise<{ native?: bigint; erc20: Map<string, bigint> }> {
  const client = clientForChain(chainId);
  if (!client) return { erc20: new Map() };

  const tokens = getTokensForChain(chainId, getDefaultNetworkViewId(chainId));
  const erc20Tokens = tokens.filter((t) => t.contractAddress && !t.isNative);

  const [native, ...erc20Results] = await Promise.all([
    client.getBalance({ address: walletAddress }).catch(() => undefined),
    ...erc20Tokens.map((token) =>
      client
        .readContract({
          address: token.contractAddress as Address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
        .catch(() => 0n),
    ),
  ]);

  const erc20 = new Map<string, bigint>();
  erc20Tokens.forEach((token, index) => {
    const value = erc20Results[index];
    if (typeof value === 'bigint' && value > 0n) {
      erc20.set(token.symbol, value);
    }
  });

  return { native, erc20 };
}

function tokenToAsset(
  token: TokenConfig,
  networkId: string,
  networkName: string,
  balance: bigint | undefined,
  prices: Record<string, number>,
): PortfolioAsset {
  const valueUsd = getTokenUsdValue(token, balance, prices);
  const coingeckoId = token.coingeckoId;
  const priceUsd =
    coingeckoId && prices[coingeckoId] !== undefined ? prices[coingeckoId] : undefined;

  return {
    id: `${networkId}-${token.symbol}-${token.contractAddress ?? 'native'}`,
    symbol: token.symbol,
    name: token.name,
    network: networkName,
    networkId,
    chainId: token.chainId,
    contractAddress: token.contractAddress,
    decimals: token.decimals,
    logo: resolveTokenLogo({
      logo: token.logo,
      coingeckoId: token.coingeckoId,
      symbol: token.symbol,
    }),
    coingeckoId: token.coingeckoId,
    priceUsd,
    balance: balance?.toString(),
    valueUsd,
    hasBalance: balance !== undefined && balance > 0n,
    fiatQuotePolicy: token.fiatQuotePolicy,
    source: 'configured',
    pendingOfficialConfiguration: token.pendingOfficialConfiguration,
  };
}

export async function fetchMultiChainPortfolio(
  walletAddress: Address,
  prices: Record<string, number>,
): Promise<{
  holdings: PortfolioAsset[];
  breakdown: NetworkHoldingsBreakdown[];
  crossChainTotalUsd: number | undefined;
}> {
  const chainIds = getFullPortfolioChainIds();
  const holdings: PortfolioAsset[] = [];
  const breakdown: NetworkHoldingsBreakdown[] = [];

  await Promise.all(
    chainIds.map(async (chainId) => {
      const chain = getChainByChainId(chainId);
      if (!chain) return;

      const networkId = chain.id;
      const { native, erc20 } = await fetchChainBalances(walletAddress, chainId);
      const tokens = getTokensForChain(chainId, networkId);

      let networkTotal = 0;
      let holdingCount = 0;
      let hasQuoted = false;

      for (const token of tokens) {
        const balance = token.isNative ? native : erc20.get(token.symbol);
        const asset = tokenToAsset(token, networkId, chain.name, balance, prices);
        if (asset.hasBalance) {
          holdings.push(asset);
          holdingCount += 1;
          if (asset.valueUsd !== undefined) {
            networkTotal += asset.valueUsd;
            hasQuoted = true;
          }
        }
      }

      breakdown.push({
        networkId,
        networkName: chain.name,
        chainId,
        totalUsd: hasQuoted ? networkTotal : undefined,
        holdingCount,
        portfolioTier: chain.portfolioTier ?? 'full',
      });
    }),
  );

  holdings.sort((a, b) => {
    const aVal = a.valueUsd ?? 0;
    const bVal = b.valueUsd ?? 0;
    if (bVal !== aVal) return bVal - aVal;
    return a.name.localeCompare(b.name);
  });

  breakdown.sort((a, b) => (b.totalUsd ?? 0) - (a.totalUsd ?? 0));

  let crossTotal = 0;
  let hasCrossQuoted = false;
  for (const row of breakdown) {
    if (row.totalUsd !== undefined) {
      crossTotal += row.totalUsd;
      hasCrossQuoted = true;
    }
  }

  return {
    holdings,
    breakdown,
    crossChainTotalUsd: hasCrossQuoted ? crossTotal : undefined,
  };
}

export function formatAssetBalance(asset: PortfolioAsset): string | null {
  if (!asset.balance) return null;
  return parseFloat(formatUnits(BigInt(asset.balance), asset.decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}
