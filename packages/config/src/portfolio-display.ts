import type { PortfolioDisplayMode } from '@entelewallet/types';

export function normalizeDisplayMode(value: unknown): PortfolioDisplayMode {
  if (value === 'all-market' || value === 'holdings-first') return value;
  return 'all-market';
}
