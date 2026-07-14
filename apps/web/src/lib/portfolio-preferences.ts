import { DEFAULT_PORTFOLIO_PREFERENCES } from '@entelewallet/config';
import type { PortfolioDisplayMode, WalletPreferences } from '@entelewallet/types';

const PREFS_KEY = 'entelewallet-portfolio-prefs';

export function readPortfolioPreferences(): WalletPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PORTFOLIO_PREFERENCES };
  }

  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PORTFOLIO_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<WalletPreferences>;
    return {
      ...DEFAULT_PORTFOLIO_PREFERENCES,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_PORTFOLIO_PREFERENCES };
  }
}

export function writePortfolioPreferences(prefs: WalletPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function updatePortfolioPreferences(patch: Partial<WalletPreferences>): WalletPreferences {
  const next = { ...readPortfolioPreferences(), ...patch };
  writePortfolioPreferences(next);
  return next;
}

export function setDisplayMode(mode: PortfolioDisplayMode): WalletPreferences {
  return updatePortfolioPreferences({ displayMode: mode });
}

export function setAutoDiscoverEnabled(enabled: boolean): WalletPreferences {
  return updatePortfolioPreferences({ autoDiscoverEnabled: enabled });
}
