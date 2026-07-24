import { NextResponse } from 'next/server';
import { CHAIN_COINGECKO_PLATFORM, contractPriceKey } from '@entelewallet/config';
import {
  fetchCmcContracts,
  fetchCmcIds,
  fetchCoingeckoContracts,
  fetchCoingeckoIds,
} from '@/lib/price-sources';

const CACHE_TTL_MS = 60_000;

type PriceCache = { updatedAt: number; prices: Record<string, number> };
let cache: PriceCache = { updatedAt: 0, prices: {} };

/** Server-side USD price proxy — CoinGecko primary, CoinMarketCap silent failover. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids') ?? '';
  const ids = [
    ...new Set(
      idsParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];

  const platform = searchParams.get('platform')?.trim();
  const contractsParam = searchParams.get('contracts') ?? '';
  const contracts = [
    ...new Set(
      contractsParam
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
  const chainId = Number(searchParams.get('chainId') ?? '0');

  if (ids.length === 0 && contracts.length === 0) {
    return NextResponse.json({ prices: {}, currency: 'usd' });
  }

  const now = Date.now();
  const stale = now - cache.updatedAt > CACHE_TTL_MS;

  const requestedKeys = [
    ...ids,
    ...contracts.map((c) => (chainId ? contractPriceKey(chainId, c) : c)),
  ];
  const missing = requestedKeys.filter((key) => cache.prices[key] === undefined);

  if (stale || missing.length > 0) {
    try {
      const nextPrices = stale ? {} : { ...cache.prices };

      if (ids.length > 0) {
        const fetchIds = stale ? ids : ids.filter((id) => nextPrices[id] === undefined);
        if (fetchIds.length > 0) {
          const fromCg = await fetchCoingeckoIds(fetchIds);
          Object.assign(nextPrices, fromCg);

          const stillMissing = fetchIds.filter((id) => nextPrices[id] === undefined);
          if (stillMissing.length > 0) {
            const fromCmc = await fetchCmcIds(stillMissing);
            for (const [id, price] of Object.entries(fromCmc)) {
              if (nextPrices[id] === undefined) nextPrices[id] = price;
            }
          }
        }
      }

      if (contracts.length > 0 && platform) {
        const fetchContracts = stale
          ? contracts
          : contracts.filter((c) => nextPrices[contractPriceKey(chainId, c)] === undefined);

        if (fetchContracts.length > 0) {
          const fromCg = await fetchCoingeckoContracts(platform, chainId, fetchContracts);
          Object.assign(nextPrices, fromCg);

          const stillMissing = fetchContracts.filter(
            (c) => nextPrices[contractPriceKey(chainId, c)] === undefined,
          );
          if (stillMissing.length > 0 && chainId) {
            const fromCmc = await fetchCmcContracts(chainId, stillMissing);
            for (const [key, price] of Object.entries(fromCmc)) {
              if (nextPrices[key] === undefined) nextPrices[key] = price;
            }
          }
        }
      }

      cache = { updatedAt: now, prices: nextPrices };
    } catch {
      const fallback = pickPrices(requestedKeys, cache.prices);
      if (Object.keys(fallback).length > 0) {
        return NextResponse.json({
          prices: fallback,
          currency: 'usd',
          updatedAt: cache.updatedAt,
          partial: true,
        });
      }
      return NextResponse.json({ error: 'Price fetch failed', prices: {} }, { status: 502 });
    }
  }

  return NextResponse.json({
    prices: pickPrices(requestedKeys, cache.prices),
    currency: 'usd',
    updatedAt: cache.updatedAt,
    platform: platform ?? undefined,
    supportedPlatforms: Object.values(CHAIN_COINGECKO_PLATFORM),
  });
}

function pickPrices(keys: string[], source: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}
