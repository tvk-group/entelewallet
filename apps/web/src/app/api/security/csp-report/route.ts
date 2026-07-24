import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/siwe-api-security';
import { enforceCspReportRateLimit, RateLimitStorageUnavailableError } from '@/lib/rate-limit';

const MAX_CSP_REPORT_BYTES = 8_192;

function redactCspReportValue(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length > 200) return `${value.slice(0, 80)}…[redacted]`;
    if (/0x[a-fA-F0-9]{40}/.test(value)) return '[redacted-address]';
    if (/[A-Za-z0-9+/]{40,}={0,2}/.test(value) && value.length > 32) return '[redacted-token]';
    return value;
  }
  if (Array.isArray(value)) return value.map(redactCspReportValue);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = redactCspReportValue(nested);
    }
    return out;
  }
  return value;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const rateLimit = await enforceCspReportRateLimit(ip);
    if (!rateLimit.allowed) {
      return new NextResponse(null, {
        status: 429,
        headers: rateLimit.retryAfterSeconds
          ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
          : undefined,
      });
    }
  } catch (err) {
    if (err instanceof RateLimitStorageUnavailableError) {
      return new NextResponse(null, { status: 503 });
    }
    throw err;
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_CSP_REPORT_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (
    !contentType.includes('application/csp-report') &&
    !contentType.includes('application/reports+json') &&
    !contentType.includes('application/json')
  ) {
    return new NextResponse(null, { status: 415 });
  }

  const raw = await request.text();
  if (!raw || raw.length > MAX_CSP_REPORT_BYTES) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const redacted = redactCspReportValue(parsed);
    console.info('[csp_report]', JSON.stringify(redacted));
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
