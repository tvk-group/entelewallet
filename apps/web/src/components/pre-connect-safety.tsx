'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n-context';
import { Alert, Card, CardContent, CardHeader, CardTitle } from '@entelewallet/ui';
import { ShieldAlert } from 'lucide-react';

const ACK_KEY = 'entelewallet-preconnect-ack';

export function usePreConnectAck() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAcknowledged(localStorage.getItem(ACK_KEY) === 'true');
    setLoaded(true);
  }, []);

  const confirm = () => {
    localStorage.setItem(ACK_KEY, 'true');
    setAcknowledged(true);
  };

  return { acknowledged, confirm, loaded };
}

export function PreConnectSafetyPanel({
  onAckChange,
}: {
  onAckChange?: (ack: boolean) => void;
}) {
  const t = useT();
  const { acknowledged, confirm, loaded } = usePreConnectAck();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loaded) onAckChange?.(acknowledged);
  }, [acknowledged, loaded, onAckChange]);

  if (!loaded) return null;

  if (acknowledged) {
    return (
      <Alert variant="info" className="animate-fade-in">
        {t('connect.noticeCustody')}
      </Alert>
    );
  }

  const notices = [
    'connect.noticeCustody',
    'connect.noticeSignature',
    'connect.noticeNeverShare',
    'connect.noticeUnderstand',
    'connect.noticeDomain',
    'connect.noticePayments',
    'connect.noticeRisk',
  ] as const;

  return (
    <Card className="border-cyan-200/80 shadow-md animate-slide-up security-panel-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlert className="h-5 w-5 text-cyan-600" />
          {t('connect.beforeConnectTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {notices.map((key) => (
            <li key={key} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
              {t(key)}
            </li>
          ))}
        </ul>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              if (e.target.checked) confirm();
              onAckChange?.(e.target.checked);
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600"
          />
          <span className="text-sm text-slate-800">{t('connect.ackCheckbox')}</span>
        </label>
        {!checked && (
          <p className="text-xs text-amber-700">{t('connect.ackRequired')}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function isPreConnectAcknowledged(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ACK_KEY) === 'true';
}
