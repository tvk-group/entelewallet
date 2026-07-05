'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import { useT } from '@/lib/i18n-context';
import { CONTACT } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, LtrSpan } from '@entelewallet/ui';

export default function SupportPage() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: '', subject: '', message: '', severity: 'medium' });

  const reportTypes = [
    t('support.reportPhishing'),
    t('support.reportFakeDomain'),
    t('support.reportSuspiciousSignature'),
    t('support.reportFakeSupport'),
    t('support.generalSupport'),
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Supabase not configured — use mailto fallback
    const mailto = `mailto:${CONTACT.security}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(form.message)}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <PageLayout title={t('support.title')} description={t('support.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {reportTypes.map((type) => (
            <Card key={type}>
              <CardContent className="p-4 text-sm font-medium text-slate-700">{type}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('support.generalSupport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-1 text-sm text-slate-600">
              <p>
                {t('support.securityEmail')}:{' '}
                <LtrSpan>
                  <a href={`mailto:${CONTACT.security}`} className="text-cyan-700">
                    {CONTACT.security}
                  </a>
                </LtrSpan>
              </p>
              <p>
                {t('support.supportEmail')}:{' '}
                <LtrSpan>
                  <a href={`mailto:${CONTACT.support}`} className="text-cyan-700">
                    {CONTACT.support}
                  </a>
                </LtrSpan>
              </p>
            </div>

            {submitted ? (
              <Alert variant="info">{t('support.formSuccess')}</Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">{t('support.formEmail')}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t('support.formSubject')}</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t('support.formMessage')}</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit">{t('support.formSubmit')}</Button>
                <p className="text-xs text-slate-400">{t('support.formFallback')} {CONTACT.security}</p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
