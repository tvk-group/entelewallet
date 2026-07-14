import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/** CoinGecko coin search — find any listed crypto by name or symbol. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) {
    return NextResponse.json({ coins: [] });
  }

  try {
    const url = new URL(`${COINGECKO_BASE}/search`);
    url.searchParams.set('query', query);

    const headers: HeadersInit = { Accept: 'application/json' };
    const apiKey = process.env.COINGECKO_API_KEY?.trim();
    if (apiKey) headers['x-cg-demo-api-key'] = apiKey;

    const res = await fetch(url.toString(), { headers, next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json({ coins: [], error: 'search_unavailable' }, { status: 502 });
    }

    const data = (await res.json()) as {
      coins?: Array<{
        id: string;
        name: string;
        symbol: string;
        market_cap_rank?: number;
        thumb?: string;
        large?: string;
      }>;
    };

    const coins = (data.coins ?? []).slice(0, 25).map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol?.toUpperCase() ?? '',
      rank: coin.market_cap_rank,
      logo: coin.large ?? coin.thumb,
    }));

    return NextResponse.json({ coins });
  } catch {
    return NextResponse.json({ coins: [], error: 'search_failed' }, { status: 502 });
  }
}
