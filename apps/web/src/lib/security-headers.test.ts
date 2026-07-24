import { describe, expect, it } from 'vitest';
import { getSecurityHeaders } from './security-headers';

describe('security headers', () => {
  it('includes baseline headers in development', () => {
    const headers = getSecurityHeaders(false);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Content-Security-Policy-Report-Only']).toContain("frame-ancestors 'none'");
    expect(headers['Strict-Transport-Security']).toBeUndefined();
  });

  it('adds HSTS in production', () => {
    const headers = getSecurityHeaders(true);
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
  });

  it('documents required third-party origins in CSP report-only', () => {
    const csp = getSecurityHeaders(true)['Content-Security-Policy-Report-Only'];
    expect(csp).toContain('walletconnect.com');
    expect(csp).toContain('supabase.co');
    expect(csp).not.toContain('unsafe-eval');
  });
});
