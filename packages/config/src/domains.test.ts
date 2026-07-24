import { describe, expect, it } from 'vitest';
import {
  CANONICAL_APP_DOMAIN,
  CANONICAL_APP_URL,
  GITHUB_REPOSITORY_URL,
  MARKETING_DOMAIN,
  MARKETING_URL,
  REDIRECT_DOMAINS,
  shouldRedirectHostToCanonicalApp,
} from './domains';

describe('canonical domain configuration', () => {
  it('defines entelewallet.app as canonical application', () => {
    expect(CANONICAL_APP_DOMAIN).toBe('entelewallet.app');
    expect(CANONICAL_APP_URL).toContain('entelewallet.app');
  });

  it('defines entelewallet.com as marketing website', () => {
    expect(MARKETING_DOMAIN).toBe('entelewallet.com');
    expect(MARKETING_URL).toContain('entelewallet.com');
  });

  it('points to the entelewallet-app repository', () => {
    expect(GITHUB_REPOSITORY_URL).toBe('https://github.com/tvk-group/entelewallet-app');
  });

  it('redirects alias hosts to canonical app', () => {
    for (const host of REDIRECT_DOMAINS) {
      expect(shouldRedirectHostToCanonicalApp(host)).toBe(true);
    }
    expect(shouldRedirectHostToCanonicalApp('entelewallet.app')).toBe(false);
  });
});
