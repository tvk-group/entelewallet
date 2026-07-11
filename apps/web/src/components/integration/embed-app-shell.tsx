'use client';

import { useEmbedRouting } from '@/lib/use-embed-routing';
import { useT } from '@/lib/i18n-context';
import type { EmbedView } from '@entelewallet/config';
import { EntelekronSourceBanner } from './entelekron-source-banner';
import { WalletPhoneFrame } from './wallet-phone-frame';
import { EmbedWalletView } from './embed-wallet-view';
import { EmbedSecurityView } from './embed-security-view';
import { EmbedTransparencyView } from './embed-transparency-view';

const VIEW_TITLE_KEYS: Record<EmbedView, string> = {
  wallet: 'integration.embedWalletTitle',
  security: 'integration.embedSecurityTitle',
  transparency: 'integration.embedTransparencyTitle',
};

function EmbedViewContent({ view }: { view: EmbedView }) {
  switch (view) {
    case 'wallet':
      return <EmbedWalletView />;
    case 'security':
      return <EmbedSecurityView />;
    case 'transparency':
      return <EmbedTransparencyView />;
  }
}

export function EmbedAppShell() {
  const t = useT();
  const { view, fromEntelekron } = useEmbedRouting();

  if (!view) return null;

  return (
    <div className="embed-app-shell mx-auto flex w-full max-w-lg flex-col gap-4 py-4">
      {fromEntelekron && <EntelekronSourceBanner />}
      <WalletPhoneFrame title={t(VIEW_TITLE_KEYS[view])}>
        <EmbedViewContent view={view} />
      </WalletPhoneFrame>
    </div>
  );
}
