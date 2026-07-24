import { describe, expect, it } from 'vitest';
import { CSP_REPORT_PATH, getSecurityHeaders } from './security-headers';

describe('security headers', () => {
  it('includes baseline headers in development', () => {
    const headers = getSecurityHeaders(false);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin-allow-popups');
    expect(headers['Content-Security-Policy-Report-Only']).toContain("frame-ancestors 'none'");
    expect(headers['Strict-Transport-Security']).toBeUndefined();
  });

  it('adds HSTS in production', () => {
    const headers = getSecurityHeaders(true);
    expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
  });

  it('documents CSP report-uri endpoint', () => {
    const csp = getSecurityHeaders(true)['Content-Security-Policy-Report-Only'];
    expect(csp).toContain(`report-uri ${CSP_REPORT_PATH}`);
    expect(csp).not.toContain('unsafe-eval');
  });
});
