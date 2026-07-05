'use client';

import { useT } from '@/lib/i18n-context';
import { PreConnectSafetyPanel, usePreConnectAck } from '@/components/pre-connect-safety';
import { Button } from '@entelewallet/ui';
import { X } from 'lucide-react';

interface PreConnectSafetyModalProps {
  open: boolean;
  onClose: () => void;
  acknowledged: boolean;
  onAckChange: (ack: boolean) => void;
  onContinue: () => void;
}

export function PreConnectSafetyModal({
  open,
  onClose,
  acknowledged,
  onAckChange,
  onContinue,
}: PreConnectSafetyModalProps) {
  const t = useT();
  const { confirm } = usePreConnectAck();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99990] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preconnect-safety-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label={t('common.cancel')}
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="preconnect-safety-title" className="text-sm font-semibold text-slate-900">
            {t('connect.beforeConnectTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label={t('common.cancel')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <PreConnectSafetyPanel
            onAckChange={(ack) => {
              onAckChange(ack);
              if (ack) confirm();
            }}
          />
        </div>
        <div className="flex gap-3 border-t border-slate-100 p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!acknowledged}
            onClick={onContinue}
          >
            {t('connect.continueConnect')}
          </Button>
        </div>
      </div>
    </div>
  );
}
