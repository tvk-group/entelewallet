'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { WalletLinkPanel } from '@/components/wallet-link-panel';
import { useT } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { useWalletStatus } from '@/lib/wallet-context';
import { DOMAIN_CONFIG, ROUTES } from '@entelewallet/config';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, LtrSpan } from '@entelewallet/ui';
import { useAccount } from 'wagmi';
import { truncateAddress } from '@entelewallet/utils';
import { ExternalLink } from 'lucide-react';

export default function AccountPage() {
  const t = useT();
  const { address, isConnected } = useAccount();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isVerified, isLinkedToAccount } = useWalletStatus();

  const accountState = !isConnected
    ? t('account.guest')
    : isLinkedToAccount
      ? t('account.investorLinked')
      : isVerified
        ? t('account.verifiedWallet')
        : t('account.connectedWallet');

  const badgeVariant = isLinkedToAccount ? 'success' : isVerified ? 'success' : 'info';

  return (
    <PageLayout title={t('account.title')} description={t('account.description')}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('account.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{t('common.status')}:</span>
              <Badge variant={badgeVariant}>{accountState}</Badge>
            </div>

            {user && !authLoading && (
              <div>
                <p className="text-sm text-slate-500">{t('walletLink.signedInAs')}</p>
                <LtrSpan className="text-sm font-medium">{user.email}</LtrSpan>
              </div>
            )}

            {isConnected && address && (
              <div>
                <p className="text-sm text-slate-500">{t('account.linkedWallets')}</p>
                <LtrSpan className="font-mono text-sm">{truncateAddress(address)}</LtrSpan>
              </div>
            )}

            <WalletLinkPanel />

            <div className="flex flex-wrap gap-3 pt-2">
              {!user && (
                <>
                  <Link href={ROUTES.signIn}>
                    <Button variant="primary" className="gap-2">
                      {t('common.signIn')}
                    </Button>
                  </Link>
                  <Link href={`${ROUTES.signIn}?mode=signup`}>
                    <Button variant="secondary" className="gap-2">
                      {t('common.createAccount')}
                    </Button>
                  </Link>
                </>
              )}
              {user && (
                <Button variant="secondary" size="sm" onClick={() => void signOut()}>
                  {t('walletLink.signOut')}
                </Button>
              )}
              {isLinkedToAccount && (
                <a
                  href={DOMAIN_CONFIG.investorAppDashboard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="gap-2">
                    {t('common.openInvestorApp')} <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href={ROUTES.support}>
                <Button variant="ghost">{t('common.contactSupport')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
