import { NextResponse } from 'next/server';
import { getAddress, isAddress } from 'viem';
import { TOKEN_REGISTRY, getChainByChainId } from '@entelewallet/config';
import type { PortfolioAsset } from '@entelewallet/types';
import {
  fetchAlchemyTokenBalances,
  fetchAlchemyTokenMetadata,
  filterAlchemyBalances,
} from '@/lib/alchemy-server';

const SPAM_SYMBOLS = new Set(['', 'UNKNOWN', 'SCAM', 'PHISH']);

function configuredContracts(chainId: number): Set<string> {
  const set = new Set<string>();
  for (const token of TOKEN_REGISTRY) {
    if (token.chainId === chainId && token.contractAddress) {
      set.add(token.contractAddress.toLowerCase());
    }
  }
  return set;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') ?? '';
  const chainId = Number(searchParams.get('chainId') ?? '1');
  const hiddenParam = searchParams.get('hidden') ?? '';
  const hidden = new Set(
    hiddenParam
      .split(',')
      .map((v) => v.toLowerCase())
      .filter(Boolean),
  );

  if (!isAddress(address)) {
    return NextResponse.json({ error: 'invalid_address' }, { status: 400 });
  }

  if (!process.env.ALCHEMY_API_KEY?.trim()) {
    return NextResponse.json({ discovered: [], error: 'alchemy_not_configured' });
  }

  try {
    const wallet = getAddress(address);
    const known = configuredContracts(chainId);
    const raw = await fetchAlchemyTokenBalances(chainId, wallet);
    const balances = filterAlchemyBalances(raw).filter(
      (row) =>
        !known.has(row.contractAddress.toLowerCase()) &&
        !hidden.has(row.contractAddress.toLowerCase()),
    );

    const discovered: PortfolioAsset[] = [];

    const slice = balances.slice(0, 40);
    await Promise.all(
      slice.map(async (row) => {
        try {
          const meta = await fetchAlchemyTokenMetadata(chainId, row.contractAddress);
          const chain = getChainByChainId(chainId);
          const symbol = (meta.symbol ?? '???').trim();
          const name = (meta.name ?? symbol).trim();

          if (SPAM_SYMBOLS.has(symbol.toUpperCase())) return;
          if (!symbol || symbol.length > 12) return;

          const decimals = meta.decimals ?? 18;
          const balance = row.tokenBalance;

          discovered.push({
            id: `discovered-${chainId}-${row.contractAddress.toLowerCase()}`,
            symbol,
            name,
            network: chain?.name ?? `Chain ${chainId}`,
            networkId: chain?.id ?? String(chainId),
            chainId,
            contractAddress: row.contractAddress,
            decimals,
            logo: meta.logo,
            balance,
            hasBalance: true,
            source: 'discovered',
            fiatQuotePolicy: 'market',
          });
        } catch {
          /* skip unresolvable metadata */
        }
      }),
    );

    discovered.sort((a, b) => {
      const aBal = BigInt(a.balance ?? '0');
      const bBal = BigInt(b.balance ?? '0');
      if (aBal === bBal) return a.symbol.localeCompare(b.symbol);
      return aBal > bBal ? -1 : 1;
    });

    return NextResponse.json({ discovered, chainId, walletAddress: wallet });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'discovery_failed';
    return NextResponse.json({ discovered: [], error: message }, { status: 502 });
  }
}
