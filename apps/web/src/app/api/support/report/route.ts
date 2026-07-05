import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getActiveSupportProvider, SUPPORT_CONFIG } from '@entelewallet/config';

const schema = z.object({
  reportType: z.string(),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  walletAddress: z.string().optional(),
  url: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const provider = getActiveSupportProvider();

    if (provider === 'supabase') {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const res = await fetch(`${url}/rest/v1/support_security_reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          email: data.email,
          subject: data.subject,
          message: data.message,
          severity: data.severity || 'medium',
          report_type: data.reportType,
          wallet_address: data.walletAddress,
          url: data.url,
          metadata: { source: 'entelewallet-lite' },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[support] Supabase error:', err);
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
