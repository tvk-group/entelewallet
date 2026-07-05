'use client';

import { Alert } from '@entelewallet/ui';
import { LITE_WARNING, SIGNATURE_WARNING } from '@entelewallet/security';
import { useT } from '@/lib/i18n-context';

export function SecurityBanner() {
  const t = useT();

  return (
    <div className="space-y-2">
      <Alert variant="info">{t('warnings.liteNotice') || LITE_WARNING}</Alert>
    </div>
  );
}

export function SignatureWarningBanner() {
  const t = useT();

  return <Alert variant="warning">{t('warnings.signatureNotice') || SIGNATURE_WARNING}</Alert>;
}
