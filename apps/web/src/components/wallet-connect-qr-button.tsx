'use client';

import { useState } from 'react';
import { useConnect, useConnectors } from 'wagmi';
import { Button } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import { isWalletConnectFeatureEnabled } from '@/lib/wagmi';
import {
  findAnyWalletConnectConnector,
  findWalletConnectModalConnector,
} from '@/lib/walletconnect-utils';
import { cn } from '@entelewallet/utils';
import { Loader2, QrCode } from 'lucide-react';

interface WalletConnectQrButtonProps {
  disabled?: boolean;
  className?: string;
}

/** Opens the WalletConnect QR modal for EnteleWALLET mobile / PWA pairing. */
export function WalletConnectQrButton({ disabled, className }: WalletConnectQrButtonProps) {
  const t = useT();
  const { connect, isPending } = useConnect();
  const connectors = useConnectors();
  const [error, setError] = useState<string | null>(null);

  if (!isWalletConnectFeatureEnabled()) {
    return null;
  }

  const handleClick = () => {
    const connector =
      findWalletConnectModalConnector(connectors) ?? findAnyWalletConnectConnector(connectors);

    if (!connector) {
      setError(t('connect.testWalletConnectNoConnector'));
      return;
    }

    setError(null);
    connect({ connector });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={disabled || isPending}
        onClick={handleClick}
        className="w-full gap-2 border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <QrCode className="h-4 w-4" />
        )}
        {t('connect.walletConnectButton')}
      </Button>
      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        {t('connect.walletConnectHint')}
      </p>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
