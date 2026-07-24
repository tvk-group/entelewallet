'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { getActiveSupportProvider, PUBLIC_CONTACT_EMAILS } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, LtrSpan } from '@entelewallet/ui';

const REPORT_TYPES = [
  { value: 'report_phishing', key: 'support.reportPhishing' },
  { value: 'report_fake_domain', key: 'support.reportFakeDomain' },
  { value: 'report_suspicious_signature', key: 'support.reportSuspiciousSignature' },
  { value: 'report_fake_support', key: 'support.reportFakeSupport' },
  { value: 'wallet_connection_issue', key: 'support.walletConnectionIssue' },
  { value: 'transparency_concern', key: 'support.transparencyConcern' },
  { value: 'general_support', key: 'support.generalSupport' },
] as const;

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportPageContent />
    </Suspense>
  );
}

function SupportPageContent() {
  const t = useT();
  const params = useSearchParams();
  const provider = getActiveSupportProvider();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    reportType:
      params.get('type') === 'phishing'
        ? 'report_phishing'
        : params.get('type') === 'domain'
          ? 'report_fake_domain'
          : 'general_support',
    email: '',
    subject: '',
    message: '',
    severity: 'medium' as const,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/support/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: form.reportType,
          email: form.email,
          subject: form.subject,
          message: form.message,
          severity: form.severity,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else if (data.mailto) {
        window.location.href = data.mailto;
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <PageLayout title={t('support.title')} description={t('support.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Alert variant="warning">{t('support.channelNotice')}</Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('support.contactChannels')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PUBLIC_CONTACT_EMAILS.map(({ email, labelKey }) => (
                <li key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 transition hover:border-cyan-200 hover:bg-cyan-50/50"
                  >
                    <span className="text-xs font-medium text-slate-500">{t(labelKey)}</span>
                    <LtrSpan className="text-sm font-medium text-cyan-900">{email}</LtrSpan>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-500">
          {provider === 'supabase' ? t('support.providerSupabase') : t('support.providerMailto')}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>{t('support.generalSupport')}</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'success' ? (
              <Alert variant="info">{t('support.formSuccess')}</Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('support.formType')}</label>
                  <select
                    value={form.reportType}
                    onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    {REPORT_TYPES.map((rt) => (
                      <option key={rt.value} value={rt.value}>
                        {t(rt.key)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('support.formEmail')}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('support.formSubject')}</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('support.formMessage')}</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" disabled={status === 'loading'}>
                  {t('support.formSubmit')}
                </Button>
                {status === 'error' && <Alert variant="error">{t('support.formError')}</Alert>}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
