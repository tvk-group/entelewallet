'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useT } from '@/lib/i18n-context';
import { useWalletUi } from '@/lib/web3-provider';
import { Button } from '@entelewallet/ui';
import { useEffect } from 'react';

interface WalletConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function WalletConnectButton({ size = 'md', disabled }: WalletConnectButtonProps) {
  const t = useT();
  const { isConnected } = useAccount();
  const { setUiState } = useWalletUi();

  useEffect(() => {
    setUiState(isConnected ? 'connected' : 'idle');
  }, [isConnected, setUiState]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
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
              <button
                type="button"
                onClick={openAccountModal}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {account.displayName}
              </button>
            ) : (
              <Button
                size={size}
                disabled={disabled}
                onClick={() => {
                  setUiState('wallet_modal_open');
                  openConnectModal();
                }}
              >
                {t('common.connectWallet')}
              </Button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
