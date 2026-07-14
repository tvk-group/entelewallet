import { NextResponse } from 'next/server';
import { CHAIN_COINGECKO_PLATFORM, contractPriceKey } from '@entelewallet/config';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 60_000;

type PriceCache = { updatedAt: number; prices: Record<string, number> };
let cache: PriceCache = { updatedAt: 0, prices: {} };

function coingeckoHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json' };
  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey;
  return headers;
}

/** Server-side USD price proxy (CoinGecko). Supports coin ids and contract addresses. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids') ?? '';
  const ids = [...new Set(idsParam.split(',').map((id) => id.trim()).filter(Boolean))];

  const platform = searchParams.get('platform')?.trim();
  const contractsParam = searchParams.get('contracts') ?? '';
  const contracts = [...new Set(contractsParam.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean))];
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
          const url = new URL(`${COINGECKO_BASE}/simple/price`);
          url.searchParams.set('ids', fetchIds.join(','));
          url.searchParams.set('vs_currencies', 'usd');
          url.searchParams.set('include_24hr_change', 'true');

          const res = await fetch(url.toString(), { headers: coingeckoHeaders(), next: { revalidate: 60 } });
          if (res.ok) {
            const data = (await res.json()) as Record<string, { usd?: number }>;
            for (const [id, row] of Object.entries(data)) {
              if (typeof row.usd === 'number') nextPrices[id] = row.usd;
            }
          }
        }
      }

      if (contracts.length > 0 && platform) {
        const fetchContracts = stale
          ? contracts
          : contracts.filter((c) => nextPrices[contractPriceKey(chainId, c)] === undefined);
        const chunkSize = 100;
        for (let i = 0; i < fetchContracts.length; i += chunkSize) {
          const chunk = fetchContracts.slice(i, i + chunkSize);
          const url = new URL(`${COINGECKO_BASE}/simple/token_price/${platform}`);
          url.searchParams.set('contract_addresses', chunk.join(','));
          url.searchParams.set('vs_currencies', 'usd');

          const res = await fetch(url.toString(), { headers: coingeckoHeaders(), next: { revalidate: 60 } });
          if (res.ok) {
            const data = (await res.json()) as Record<string, { usd?: number }>;
            for (const [address, row] of Object.entries(data)) {
              if (typeof row.usd === 'number' && chainId) {
                nextPrices[contractPriceKey(chainId, address)] = row.usd;
              }
            }
          }
        }
      }

      cache = { updatedAt: now, prices: nextPrices };
    } catch {
      return NextResponse.json(
        { error: 'Price fetch failed', prices: pickPrices(requestedKeys, cache.prices) },
        { status: 502 },
      );
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
