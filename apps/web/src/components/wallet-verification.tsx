'use client';

import { useState } from 'react';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { Button, Badge, Alert, LtrSpan } from '@entelewallet/ui';
import { useT } from '@/lib/i18n-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { getChainConfig } from '@entelewallet/config';
import { getVerificationBadgeKey } from '@entelewallet/wallet-core';
import { SignatureWarningBanner } from './security-banner';
import { WalletLinkPanel } from './wallet-link-panel';
import { ShieldCheck, Loader2 } from 'lucide-react';
import type { Address } from 'viem';

const SIGNATURE_TIMEOUT_MS = 120_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function WalletVerification() {
  const t = useT();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { verificationStatus, setVerificationStatus, isVerified, isLinkedToAccount, verifiedAt } =
    useWalletStatus();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const chain = getChainConfig(chainId);
  const badgeVariant =
    verificationStatus === 'verified'
      ? 'success'
      : verificationStatus === 'verification_failed'
        ? 'error'
        : verificationStatus === 'signature_pending'
          ? 'warning'
          : 'info';

  async function handleVerify() {
    if (!address || !isConnected) return;
    setError(null);
    setLoading(true);
    setVerificationStatus('signature_pending');

    try {
      const nonceRes = await fetch('/api/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, chainId }),
      });

      const nonceBody = await nonceRes.json().catch(() => ({}));
      if (!nonceRes.ok) {
        throw new Error(
          typeof nonceBody.error === 'string'
            ? nonceBody.error
            : 'Failed to create verification nonce',
        );
      }

      const { message } = nonceBody as { message: string };

      const signature = await withTimeout(
        signMessageAsync({ message, account: address as Address }),
        SIGNATURE_TIMEOUT_MS,
        t('connect.signatureTimeout'),
      );

      const verifyRes = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, signature, address, chainId }),
      });

      const result = await verifyRes.json();

      if (!verifyRes.ok || !result.success) {
        setVerificationStatus('verification_failed');
        setError(result.error || t('connect.verificationFailed'));
        return;
      }

      setVerificationStatus('verified');
    } catch (err) {
      setVerificationStatus('verification_failed');
      const message = err instanceof Error ? err.message : t('connect.verificationFailed');
      if (
        message.toLowerCase().includes('user rejected') ||
        message.toLowerCase().includes('denied')
      ) {
        setError(t('connect.signatureRejected'));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="text-sm text-slate-500">{t('connect.connectedAddress')}</p>
          <LtrSpan className="text-sm font-medium">{address}</LtrSpan>
        </div>
        <div>
          <p className="text-sm text-slate-500">{t('connect.network')}</p>
          <p className="text-sm font-medium">{chain?.name ?? `Chain ${chainId}`}</p>
        </div>
        {connector?.name && (
          <div>
            <p className="text-sm text-slate-500">{t('connect.walletType')}</p>
            <p className="text-sm font-medium">{connector.name}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-slate-500">{t('connect.verificationStatus')}</p>
          <Badge variant={badgeVariant}>{t(getVerificationBadgeKey(verificationStatus))}</Badge>
        </div>
      </div>

      {!isVerified && (
        <>
          <SignatureWarningBanner />
          <p className="text-sm text-slate-600">{t('connect.verifyPrompt')}</p>
          {verificationStatus === 'signature_pending' && (
            <Alert variant="info">{t('connect.openWalletToSign')}</Alert>
          )}
          <Button onClick={handleVerify} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('connect.verifying')}
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {t('common.verifyOwnership')}
              </>
            )}
          </Button>
        </>
      )}

      {isVerified && (
        <Alert variant="info">
          <ShieldCheck className="mr-2 inline h-4 w-4" />
          {t('connect.verified')}
          {verifiedAt && (
            <span className="ml-2 text-xs opacity-75">
              (<LtrSpan>{new Date(verifiedAt).toLocaleString()}</LtrSpan>)
            </span>
          )}
        </Alert>
      )}

      {isVerified && !isLinkedToAccount && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700">{t('walletLink.title')}</p>
          <WalletLinkPanel compact />
        </div>
      )}

      {isLinkedToAccount && (
        <Alert variant="info">
          <ShieldCheck className="mr-2 inline h-4 w-4" />
          {t('walletLink.linkedDescription')}
        </Alert>
      )}

      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
