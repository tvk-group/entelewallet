'use client';

import { useT } from '@/lib/i18n-context';
import { Alert, Card, CardContent } from '@entelewallet/ui';
import { isWalletConnectConfigured } from '@/lib/wagmi';

export function WalletConnectGuide() {
  const t = useT();

  return (
    <Card className="border-cyan-200/80 bg-cyan-50/30">
      <CardContent className="space-y-4 p-6 text-sm text-slate-700">
        <div>
          <h3 className="font-semibold text-slate-900">{t('connect.browserWalletsTitle')}</h3>
          <p className="mt-1">{t('connect.browserWalletsDesc')}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{t('connect.mobileWalletsTitle')}</h3>
          <p className="mt-1">{t('connect.mobileWalletsDesc')}</p>
        </div>
        <Alert variant="info">{t('connect.walletConnectHint')}</Alert>
        {!isWalletConnectConfigured && (
          <Alert variant="warning">
            {process.env.NODE_ENV === 'development'
              ? t('connect.walletConnectDevWarning')
              : t('connect.walletConnectUnavailable')}
          </Alert>
        )}
        <p className="text-xs text-slate-500">{t('connect.viaWalletConnectNote')}</p>
      </CardContent>
    </Card>
  );
}
