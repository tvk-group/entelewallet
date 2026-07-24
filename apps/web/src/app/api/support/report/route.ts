import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getActiveSupportProvider, SUPPORT_CONFIG } from '@entelewallet/config';
import { getClientIp } from '@/lib/siwe-api-security';
import { enforceSupportReportRateLimit, RateLimitStorageUnavailableError } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

const MAX_SUPPORT_REPORT_BYTES = 16_384;

const schema = z.object({
  reportType: z.string().min(1).max(64),
  email: z.string().email().max(320),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(8_000),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  walletAddress: z.string().max(128).optional(),
  url: z.string().url().max(2_048).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const rateLimit = await enforceSupportReportRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds
            ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
            : undefined,
        },
      );
    }
  } catch (err) {
    if (err instanceof RateLimitStorageUnavailableError) {
      return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
    }
    throw err;
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && Number.parseInt(contentLength, 10) > MAX_SUPPORT_REPORT_BYTES) {
    return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    const provider = getActiveSupportProvider();

    if (provider === 'supabase') {
      const admin = createAdminClient();
      if (!admin) {
        return NextResponse.json(
          {
            success: false,
            provider,
            error: 'Support storage unavailable',
            fallback: 'mailto',
          },
          { status: 503 },
        );
      }

      const { error } = await admin.from('support_security_reports').insert({
        email: data.email,
        subject: data.subject,
        message: data.message,
        severity: data.severity || 'medium',
        report_type: data.reportType,
        wallet_address: data.walletAddress,
        url: data.url,
        metadata: { source: 'entelewallet-lite' },
      });

      if (error) {
        console.error('[support] Supabase insert failed');
        return NextResponse.json(
          { success: false, provider, error: 'Storage failed', fallback: 'mailto' },
          { status: 502 },
        );
      }

      return NextResponse.json({ success: true, provider: 'supabase' });
    }

    if (provider === 'formspree' && SUPPORT_CONFIG.formspreeEndpoint) {
      const res = await fetch(SUPPORT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        return NextResponse.json({ success: false, provider, fallback: 'mailto' }, { status: 502 });
      }
      return NextResponse.json({ success: true, provider: 'formspree' });
    }

    return NextResponse.json({
      success: false,
      provider: 'mailto',
      mailto: `mailto:${SUPPORT_CONFIG.securityEmail}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`${data.message}\n\nFrom: ${data.email}`)}`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 },
    );
  }
}
