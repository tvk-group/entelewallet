import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 60_000;

type PriceCache = { updatedAt: number; prices: Record<string, number> };
let cache: PriceCache = { updatedAt: 0, prices: {} };

/** Server-side USD price proxy (CoinGecko). Optional COINGECKO_API_KEY for higher limits. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids') ?? '';
  const ids = [...new Set(idsParam.split(',').map((id) => id.trim()).filter(Boolean))];

  if (ids.length === 0) {
    return NextResponse.json({ prices: {}, currency: 'usd' });
  }

  const now = Date.now();
  const stale = now - cache.updatedAt > CACHE_TTL_MS;
  const missing = ids.filter((id) => cache.prices[id] === undefined);

  if (stale || missing.length > 0) {
    try {
      const fetchIds = stale ? ids : missing;
      const url = new URL(`${COINGECKO_BASE}/simple/price`);
      url.searchParams.set('ids', fetchIds.join(','));
      url.searchParams.set('vs_currencies', 'usd');

      const apiKey = process.env.COINGECKO_API_KEY?.trim();
      const headers: HeadersInit = { Accept: 'application/json' };
      if (apiKey) headers['x-cg-demo-api-key'] = apiKey;

      const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Price provider unavailable', prices: pickPrices(ids, cache.prices) },
          { status: 502 },
        );
      }

      const data = (await res.json()) as Record<string, { usd?: number }>;
      const nextPrices = stale ? {} : { ...cache.prices };
      for (const [id, row] of Object.entries(data)) {
        if (typeof row.usd === 'number') nextPrices[id] = row.usd;
      }
      cache = { updatedAt: now, prices: nextPrices };
    } catch {
      return NextResponse.json(
        { error: 'Price fetch failed', prices: pickPrices(ids, cache.prices) },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({
    prices: pickPrices(ids, cache.prices),
    currency: 'usd',
    updatedAt: cache.updatedAt,
  });
}

function pickPrices(ids: string[], source: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const id of ids) {
    if (source[id] !== undefined) out[id] = source[id];
  }
  return out;
}
