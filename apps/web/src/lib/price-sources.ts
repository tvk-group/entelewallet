import {
  contractPriceKey,
  getCmcPlatform,
  resolveCmcSlug,
} from '@entelewallet/config';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CMC_BASE = 'https://pro-api.coinmarketcap.com';

function coingeckoHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json' };
  const apiKey = process.env.COINGECKO_API_KEY?.trim();
  if (apiKey) headers['x-cg-demo-api-key'] = apiKey;
  return headers;
}

function cmcHeaders(): HeadersInit | null {
  const apiKey = process.env.COINMARKETCAP_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    Accept: 'application/json',
    'X-CMC_PRO_API_KEY': apiKey,
  };
}

type CmcQuoteEntry = {
  slug?: string;
  platform?: { token_address?: string };
  quote?: { USD?: { price?: number } };
};

export async function fetchCoingeckoIds(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};

  const url = new URL(`${COINGECKO_BASE}/simple/price`);
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('vs_currencies', 'usd');

  const res = await fetch(url.toString(), { headers: coingeckoHeaders(), next: { revalidate: 60 } });
  if (!res.ok) return {};

  const data = (await res.json()) as Record<string, { usd?: number }>;
  const out: Record<string, number> = {};
  for (const [id, row] of Object.entries(data)) {
    if (typeof row.usd === 'number') out[id] = row.usd;
  }
  return out;
}

export async function fetchCoingeckoContracts(
  platform: string,
  chainId: number,
  contracts: string[],
): Promise<Record<string, number>> {
  if (contracts.length === 0) return {};

  const out: Record<string, number> = {};
  const chunkSize = 100;

  for (let i = 0; i < contracts.length; i += chunkSize) {
    const chunk = contracts.slice(i, i + chunkSize);
    const url = new URL(`${COINGECKO_BASE}/simple/token_price/${platform}`);
    url.searchParams.set('contract_addresses', chunk.join(','));
    url.searchParams.set('vs_currencies', 'usd');

    const res = await fetch(url.toString(), { headers: coingeckoHeaders(), next: { revalidate: 60 } });
    if (!res.ok) continue;

    const data = (await res.json()) as Record<string, { usd?: number }>;
    for (const [address, row] of Object.entries(data)) {
      if (typeof row.usd === 'number') {
        out[contractPriceKey(chainId, address)] = row.usd;
      }
    }
  }

  return out;
}

/** Silent failover — only fills ids CoinGecko did not return. */
export async function fetchCmcIds(coingeckoIds: string[]): Promise<Record<string, number>> {
  const headers = cmcHeaders();
  if (!headers || coingeckoIds.length === 0) return {};

  const slugToCoingecko = new Map<string, string>();
  const slugs = [...new Set(coingeckoIds.map((id) => {
    const slug = resolveCmcSlug(id);
    slugToCoingecko.set(slug, id);
    return slug;
  }))];

  const url = new URL(`${CMC_BASE}/v2/cryptocurrency/quotes/latest`);
  url.searchParams.set('slug', slugs.join(','));
  url.searchParams.set('convert', 'USD');

  const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
  if (!res.ok) return {};

  const data = (await res.json()) as { data?: Record<string, CmcQuoteEntry> };
  const out: Record<string, number> = {};

  for (const entry of Object.values(data.data ?? {})) {
    const price = entry.quote?.USD?.price;
    const coingeckoId = entry.slug ? slugToCoingecko.get(entry.slug) : undefined;
    if (coingeckoId && typeof price === 'number') {
      out[coingeckoId] = price;
    }
  }

  return out;
}

/** Silent failover — only fills contracts CoinGecko did not return. */
export async function fetchCmcContracts(
  chainId: number,
  contracts: string[],
): Promise<Record<string, number>> {
  const headers = cmcHeaders();
  const platform = getCmcPlatform(chainId);
  if (!headers || !platform || contracts.length === 0) return {};

  const out: Record<string, number> = {};
  const chunkSize = 30;

  for (let i = 0; i < contracts.length; i += chunkSize) {
    const chunk = contracts.slice(i, i + chunkSize);
    const url = new URL(`${CMC_BASE}/v2/cryptocurrency/quotes/latest`);
    url.searchParams.set('address', chunk.join(','));
    url.searchParams.set('platform', platform);
    url.searchParams.set('convert', 'USD');

    const res = await fetch(url.toString(), { headers, next: { revalidate: 60 } });
    if (!res.ok) continue;

    const data = (await res.json()) as { data?: Record<string, CmcQuoteEntry> };
    for (const entry of Object.values(data.data ?? {})) {
      const address = entry.platform?.token_address?.toLowerCase();
      const price = entry.quote?.USD?.price;
      if (address && typeof price === 'number') {
        out[contractPriceKey(chainId, address)] = price;
      }
    }
  }

  return out;
}
