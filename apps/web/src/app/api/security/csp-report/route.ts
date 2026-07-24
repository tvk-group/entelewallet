import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/siwe-api-security';
import { parseSanitizedCspReport } from '@/lib/csp-report-parser';
import { enforceCspReportRateLimit, RateLimitStorageUnavailableError } from '@/lib/rate-limit';

const MAX_CSP_REPORT_BYTES = 8_192;

async function readBodyWithByteLimit(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return null;

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let body = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return body;
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

  const raw = await readBodyWithByteLimit(request, MAX_CSP_REPORT_BYTES);
  if (raw === null) {
    return new NextResponse(null, { status: 413 });
  }
  if (!raw) {
    return new NextResponse(null, { status: 400 });
  }

  const sanitized = parseSanitizedCspReport(raw);
  if (!sanitized) {
    return new NextResponse(null, { status: 400 });
  }

  console.info('[csp_report]', JSON.stringify(sanitized));

  return new NextResponse(null, { status: 204 });
}
