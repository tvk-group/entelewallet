'use client';

import Link from 'next/link';
import { PageLayout } from '@/components/page-layout';
import { AssetGrid } from '@/components/asset-grid';
import { useT } from '@/lib/i18n-context';
import { ROUTES } from '@entelewallet/config';
import { Card, CardContent, Button } from '@entelewallet/ui';
import { useAccount } from 'wagmi';

export default function AssetsPage() {
  const t = useT();
  const { isConnected } = useAccount();

  return (
    <PageLayout title={t('assets.title')} description={t('assets.description')}>
      {!isConnected ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">{t('common.connectToView')}</p>
            <Link href={ROUTES.connect} className="mt-4 inline-block">
              <Button>{t('common.goToConnect')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <AssetGrid />
      )}
    </PageLayout>
  );
}
