const MAX_CSP_FIELD_COUNT = 32;
const MAX_CSP_STRING_LENGTH = 512;
const MAX_CSP_OBJECT_DEPTH = 4;

const CSP_REPORT_FIELDS = new Set([
  'document-uri',
  'referrer',
  'violated-directive',
  'effective-directive',
  'original-policy',
  'disposition',
  'blocked-uri',
  'line-number',
  'column-number',
  'source-file',
  'status-code',
  'script-sample',
]);

const REPORTING_API_TYPES = new Set(['csp-violation', 'network-error']);

export interface SanitizedCspReport {
  format: 'csp-report' | 'reporting-api';
  fields: Record<string, string | number>;
}

function truncateString(value: string): string {
  if (value.length <= MAX_CSP_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_CSP_STRING_LENGTH)}…`;
}

/** Strip query strings, fragments, credentials, and userinfo from URLs. */
export function sanitizeReportUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    parsed.username = '';
    parsed.password = '';
    parsed.search = '';
    parsed.hash = '';
    return truncateString(parsed.toString());
  } catch {
    const withoutFragment = raw.split('#')[0] ?? raw;
    const withoutQuery = withoutFragment.split('?')[0] ?? withoutFragment;
    return truncateString(withoutQuery);
  }
}

function sanitizeFieldValue(key: string, value: unknown): string | number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (key === 'line-number' || key === 'column-number' || key === 'status-code') {
      return Math.trunc(value);
    }
    return undefined;
  }

  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (key.endsWith('-uri') || key === 'source-file' || key === 'referrer') {
    return sanitizeReportUrl(trimmed);
  }

  if (key === 'script-sample') {
    return truncateString(trimmed.slice(0, 120));
  }

  return truncateString(trimmed);
}

function parseCspReportObject(value: unknown, depth = 0): Record<string, string | number> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > MAX_CSP_OBJECT_DEPTH) {
    return null;
  }

  const out: Record<string, string | number> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (!CSP_REPORT_FIELDS.has(key)) continue;
    const sanitized = sanitizeFieldValue(key, nested);
    if (sanitized !== undefined) out[key] = sanitized;
    if (Object.keys(out).length >= MAX_CSP_FIELD_COUNT) break;
  }

  return Object.keys(out).length > 0 ? out : null;
}

export function parseSanitizedCspReport(raw: string): SanitizedCspReport | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }

  if (Array.isArray(parsed)) {
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const report = entry as Record<string, unknown>;
      const type = typeof report.type === 'string' ? report.type : '';
      if (!REPORTING_API_TYPES.has(type)) continue;
      const fields = parseCspReportObject(report.body, 1);
      if (fields) return { format: 'reporting-api', fields };
    }
    return null;
  }

  const root = parsed as Record<string, unknown>;

  if (root['csp-report']) {
    const fields = parseCspReportObject(root['csp-report']);
    return fields ? { format: 'csp-report', fields } : null;
  }

  const type = typeof root.type === 'string' ? root.type : '';
  if (REPORTING_API_TYPES.has(type) && root.body) {
    const fields = parseCspReportObject(root.body, 1);
    return fields ? { format: 'reporting-api', fields } : null;
  }

  return null;
}
