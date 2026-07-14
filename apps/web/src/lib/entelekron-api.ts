import { DOMAIN_CONFIG } from '@entelewallet/config';
import type {
  PortfolioResponse,
  WalletPreferences,
  WatchlistResponse,
} from '@entelewallet/types';

const ENTELEKRON_BASE = (DOMAIN_CONFIG.entelekron || 'https://entelekron.io').replace(/\/$/, '');

export class EntelekronApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'EntelekronApiError';
  }
}

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function entelekronFetch<T>(path: string, init?: RequestInit & { token?: string | null }): Promise<T> {
  const { token, ...rest } = init ?? {};
  const res = await fetch(`${ENTELEKRON_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...getAuthHeaders(token),
      ...(rest.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new EntelekronApiError(`EnteleKRON API ${path} failed`, res.status);
  }

  return (await res.json()) as T;
}

export async function fetchPortfolio(token?: string | null): Promise<PortfolioResponse> {
  return entelekronFetch<PortfolioResponse>('/api/wallet/portfolio', { token });
}

export async function fetchWalletPreferences(token?: string | null): Promise<WalletPreferences> {
  return entelekronFetch<WalletPreferences>('/api/user/wallet-preferences', { token });
}

export async function patchWalletPreferences(
  patch: Partial<WalletPreferences>,
  token?: string | null,
): Promise<WalletPreferences> {
  return entelekronFetch<WalletPreferences>('/api/user/wallet-preferences', {
    method: 'PATCH',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

export async function fetchWatchlist(token?: string | null): Promise<WatchlistResponse> {
  return entelekronFetch<WatchlistResponse>('/api/user/watchlist', { token });
}

export async function putWatchlist(symbols: string[], token?: string | null): Promise<WatchlistResponse> {
  return entelekronFetch<WatchlistResponse>('/api/user/watchlist', {
    method: 'PUT',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
  });
}
