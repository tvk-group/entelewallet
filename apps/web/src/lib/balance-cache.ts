/** Persist last-known balances so the portfolio feels instant on connect and refresh. */

const STORAGE_PREFIX = 'entelewallet:balances:';

export type CachedPortfolioBalances = {
  updatedAt: number;
  native?: string;
  erc20: Record<string, string>;
};

export function balanceCacheKey(
  address: string,
  chainId: number,
  networkViewId: string,
): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}:${chainId}:${networkViewId}`;
}

export function readBalanceCache(key: string): CachedPortfolioBalances | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPortfolioBalances;
    if (!parsed || typeof parsed.updatedAt !== 'number') return null;
    return {
      updatedAt: parsed.updatedAt,
      native: parsed.native,
      erc20: parsed.erc20 ?? {},
    };
  } catch {
    return null;
  }
}

export function writeBalanceCache(key: string, data: CachedPortfolioBalances): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Quota or private mode — ignore.
  }
}
