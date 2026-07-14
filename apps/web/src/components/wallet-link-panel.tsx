'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useChainId } from 'wagmi';
import { Alert, Badge, Button } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { linkWalletToAccount } from '@/lib/wallet-link-api';
import { ROUTES } from '@entelewallet/config';
import { getVerificationBadgeKey } from '@entelewallet/wallet-core';
import { Link2, Loader2, LogIn } from 'lucide-react';

const ERROR_KEYS: Record<string, string> = {
  sign_in_required: 'walletLink.signInRequired',
  verification_required: 'walletLink.verificationExpired',
  wallet_linked_to_other_account: 'walletLink.linkedToOtherAccount',
  supabase_not_configured: 'walletLink.notConfigured',
  link_failed: 'walletLink.linkFailed',
  link_insert_failed: 'walletLink.linkFailed',
  link_update_failed: 'walletLink.linkFailed',
};

interface WalletLinkPanelProps {
  compact?: boolean;
}

export function WalletLinkPanel({ compact = false }: WalletLinkPanelProps) {
  const t = useT();
  const { user, isLoading: authLoading, isConfigured } = useAuth();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const {
    verificationStatus,
    isVerified,
    isLinkedToAccount,
    linkedAt,
    refreshLinkStatus,
    setVerificationStatus,
  } = useWalletStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  if (!isConnected || !address) {
    return (
      <Alert variant="info">
        {t('walletLink.connectFirst')}{' '}
        <Link href={ROUTES.connect} className="font-medium underline">
          {t('common.goToConnect')}
        </Link>
      </Alert>
    );
  }

  if (authLoading) {
    return <p className="text-sm text-slate-500">{t('common.loading')}</p>;
  }

  if (!isConfigured) {
    return <Alert variant="warning">{t('walletLink.notConfigured')}</Alert>;
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">{t('walletLink.signInPrompt')}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={`${ROUTES.signIn}?next=${encodeURIComponent(ROUTES.account)}`}>
            <Button variant="primary" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              {t('common.signIn')}
            </Button>
          </Link>
          <Link href={`${ROUTES.signIn}?mode=signup&next=${encodeURIComponent(ROUTES.account)}`}>
            <Button variant="secondary" size="sm">
              {t('common.createAccount')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'linked_to_other_account') {
    return <Alert variant="error">{t('walletLink.linkedToOtherAccount')}</Alert>;
  }

  if (isLinkedToAccount) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">{t(getVerificationBadgeKey('linked_to_account'))}</Badge>
          {!compact && (
            <span className="text-sm text-slate-600">{t('walletLink.linkedDescription')}</span>
          )}
        </div>
        {linkedAt && (
          <p className="text-xs text-slate-500">
            {t('walletLink.linkedAt')}: {new Date(linkedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  async function handleLink() {
    if (!address) return;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    const result = await linkWalletToAccount({
      address,
      chainId,
      walletType: connector?.name,
    });

    setLoading(false);

    if (!result.success) {
      const code = result.error ?? 'link_failed';
      const key = ERROR_KEYS[code] ?? 'walletLink.linkFailed';
      setErrorCode(code);
      setError(t(key));
      if (result.error === 'wallet_linked_to_other_account') {
        setVerificationStatus('linked_to_other_account');
      }
      return;
    }

    setVerificationStatus('linked_to_account');
    await refreshLinkStatus();
  }

  return (
    <div className="space-y-3">
      {!isVerified && (
        <Alert variant="warning">
          {t('walletLink.verificationRequired')}{' '}
          <Link href={ROUTES.connect} className="font-medium underline">
            {t('common.verifyOwnership')}
          </Link>
        </Alert>
      )}

      {isVerified && (
        <>
          <p className="text-sm text-slate-600">{t('walletLink.readyToLink')}</p>
          <Button onClick={handleLink} disabled={loading} size="sm" className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('walletLink.linking')}
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                {t('walletLink.linkWallet')}
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500">{t('walletLink.verificationWindowHint')}</p>
        </>
      )}

      {error && (
        <Alert variant="error">
          {error}
          {errorCode === 'verification_required' && (
            <span>
              {' '}
              <Link href={ROUTES.connect} className="font-medium underline">
                {t('walletLink.reverify')}
              </Link>
            </span>
          )}
        </Alert>
      )}
    </div>
  );
}
