import { describe, expect, it } from 'vitest';
import { parseSanitizedCspReport, sanitizeReportUrl } from './csp-report-parser';

const reportingApiBody = {
  'document-uri': 'https://entelewallet.app/assets',
  'violated-directive': 'script-src',
  'blocked-uri': 'https://evil.example/script.js',
};

describe('csp-report-parser', () => {
  it('parses legacy csp-report object payloads with documented fields only', () => {
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

  it('parses a single Reporting API object payload', () => {
    const report = parseSanitizedCspReport(
      JSON.stringify({
        type: 'csp-violation',
        body: reportingApiBody,
      }),
    );

    expect(report?.format).toBe('reporting-api');
    expect(report?.fields['document-uri']).toBe('https://entelewallet.app/assets');
    expect(report?.fields['blocked-uri']).toBe('https://evil.example/script.js');
  });

  it('parses Reporting API array payloads using the first valid report', () => {
    const report = parseSanitizedCspReport(
      JSON.stringify([
        { type: 'unknown-type', body: reportingApiBody },
        { type: 'csp-violation', body: reportingApiBody },
      ]),
    );

    expect(report?.format).toBe('reporting-api');
    expect(report?.fields['violated-directive']).toBe('script-src');
  });

  it('rejects malformed and oversized payloads', () => {
    expect(parseSanitizedCspReport('{not-json')).toBeNull();
    expect(parseSanitizedCspReport(JSON.stringify([]))).toBeNull();
    expect(
      parseSanitizedCspReport(JSON.stringify([{ type: 'csp-violation', body: {} }])),
    ).toBeNull();

    const oversizedUri = `https://entelewallet.app/${'a'.repeat(600)}`;
    const report = parseSanitizedCspReport(
      JSON.stringify({
        'csp-report': {
          'document-uri': oversizedUri,
          'violated-directive': 'script-src',
        },
      }),
    );

    const documentUri = report?.fields['document-uri'];
    expect(typeof documentUri).toBe('string');
    expect((documentUri as string).length).toBeLessThanOrEqual(513);
    expect(documentUri).toMatch(/…$/);
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
