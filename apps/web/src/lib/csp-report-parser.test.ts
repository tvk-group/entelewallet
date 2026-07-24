import { describe, expect, it } from 'vitest';
import { parseSanitizedCspReport, sanitizeReportUrl } from './csp-report-parser';

describe('csp-report-parser', () => {
  it('parses legacy csp-report payloads with documented fields only', () => {
    const report = parseSanitizedCspReport(
      JSON.stringify({
        'csp-report': {
          'document-uri': 'https://entelewallet.app/page?token=secret#frag',
          'violated-directive': 'script-src',
          'blocked-uri': 'inline',
          'ignored-field': 'drop-me',
        },
      }),
    );

    expect(report?.format).toBe('csp-report');
    expect(report?.fields['document-uri']).toBe('https://entelewallet.app/page');
    expect(report?.fields).not.toHaveProperty('ignored-field');
  });

  it('strips credentials from URLs', () => {
    expect(sanitizeReportUrl('https://user:pass@entelewallet.app/path?q=1#hash')).toBe(
      'https://entelewallet.app/path',
    );
  });

  it('rejects payloads without documented CSP fields', () => {
    expect(parseSanitizedCspReport(JSON.stringify({ foo: 'bar' }))).toBeNull();
  });
});
