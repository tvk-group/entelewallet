'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useT } from '@/lib/i18n-context';
import { Button } from '@entelewallet/ui';

export function WalletConnectButton() {
  const t = useT();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {connected ? (
              <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
            ) : (
              <Button onClick={openConnectModal} size="lg">
                {t('common.connectWallet')}
              </Button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
