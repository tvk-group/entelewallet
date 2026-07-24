import { NextResponse } from 'next/server';
import { contractPriceKey } from '@entelewallet/config';
import { getClientIp } from '@/lib/siwe-api-security';
import { enforcePricesApiRateLimit, RateLimitStorageUnavailableError } from '@/lib/rate-limit';
import {
  estimateUpstreamRequestCount,
  parsePriceContracts,
  parsePriceIds,
  PRICES_API_LIMITS,
  resolveTrustedCoingeckoPlatform,
} from '@/lib/prices-api';
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
  const requestUrl = request.url;
  if (requestUrl.length > PRICES_API_LIMITS.maxQueryLength) {
    return NextResponse.json({ error: 'Query too long' }, { status: 414 });
  }

  const ip = getClientIp(request);
  try {
    const rateLimit = await enforcePricesApiRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds
            ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
            : undefined,
        },
      );
    }
  } catch (err) {
    if (err instanceof RateLimitStorageUnavailableError) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }
    throw err;
  }

  const { searchParams } = new URL(requestUrl);
  const ids = parsePriceIds(searchParams.get('ids') ?? '');
  const contracts = parsePriceContracts(searchParams.get('contracts') ?? '');
  const chainIdParam = searchParams.get('chainId');
  const chainId = chainIdParam ? Number(chainIdParam) : 0;
  const requestedPlatform = searchParams.get('platform');

  if (ids.length === 0 && contracts.length === 0) {
    return NextResponse.json({ prices: {}, currency: 'usd' });
  }

  if (contracts.length > 0) {
    const platformResult = resolveTrustedCoingeckoPlatform({ chainId, requestedPlatform });
    if ('error' in platformResult) {
      return NextResponse.json({ error: platformResult.error }, { status: platformResult.status });
    }

    const upstreamCount = estimateUpstreamRequestCount(ids, contracts);
    if (upstreamCount > PRICES_API_LIMITS.maxUpstreamRequests) {
      return NextResponse.json({ error: 'Too many upstream requests' }, { status: 400 });
    }

    return handlePriceRequest({
      ids,
      contracts,
      chainId,
      platform: platformResult.platform,
    });
  }

  if (requestedPlatform) {
    return NextResponse.json({ error: 'Platform requires contracts and chainId' }, { status: 400 });
  }

  const upstreamCount = estimateUpstreamRequestCount(ids, contracts);
  if (upstreamCount > PRICES_API_LIMITS.maxUpstreamRequests) {
    return NextResponse.json({ error: 'Too many upstream requests' }, { status: 400 });
  }

  return handlePriceRequest({ ids, contracts, chainId: 0, platform: undefined });
}

async function handlePriceRequest(params: {
  ids: string[];
  contracts: string[];
  chainId: number;
  platform: string | undefined;
}) {
  const { ids, contracts, chainId, platform } = params;
  const now = Date.now();
  const stale = now - cache.updatedAt > CACHE_TTL_MS;

  const requestedKeys = [
    ...ids,
    ...contracts.map((contract) => contractPriceKey(chainId, contract)),
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

      if (contracts.length > 0 && platform && chainId > 0) {
        const fetchContracts = stale
          ? contracts
          : contracts.filter(
              (contract) => nextPrices[contractPriceKey(chainId, contract)] === undefined,
            );

        if (fetchContracts.length > 0) {
          const fromCg = await fetchCoingeckoContracts(platform, chainId, fetchContracts);
          Object.assign(nextPrices, fromCg);

          const stillMissing = fetchContracts.filter(
            (contract) => nextPrices[contractPriceKey(chainId, contract)] === undefined,
          );
          if (stillMissing.length > 0) {
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
  });
}

function pickPrices(keys: string[], source: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}
