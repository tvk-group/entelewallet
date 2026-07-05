'use client';

import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ReactNode, useState, createContext, useContext, useMemo } from 'react';
import { useI18n } from '@/lib/i18n-context';
import type { LocaleCode } from '@entelewallet/i18n';
import { CANONICAL_APP_URL } from '@entelewallet/config';
import {
  createEnteleWagmiConfig,
  isWalletConnectConfigured,
  walletConnectProjectId,
} from '@/lib/entele-wallets';

export type WalletUiState =
  | 'idle'
  | 'safety_required'
  | 'modal_open'
  | 'connecting'
  | 'connected'
  | 'connection_rejected'
  | 'connection_failed'
  | 'walletconnect_missing_project_id'
  | 'unsupported_network'
  | 'verified'
  | 'verification_failed';

const WalletUiContext = createContext<{
  uiState: WalletUiState;
  setUiState: (s: WalletUiState) => void;
  connectError: string | null;
  setConnectError: (e: string | null) => void;
}>({
  uiState: 'idle',
  setUiState: () => {},
  connectError: null,
  setConnectError: () => {},
});

export function useWalletUi() {
  return useContext(WalletUiContext);
}

const RK_LOCALE_MAP: Partial<Record<LocaleCode, string>> = {
  en: 'en', de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt', nl: 'nl',
  ru: 'ru', ja: 'ja', ko: 'ko', zh: 'zh', tr: 'tr', ar: 'ar',
};

function RainbowKitInner({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [uiState, setUiState] = useState<WalletUiState>('idle');
  const [connectError, setConnectError] = useState<string | null>(null);
  const rkLocale = (RK_LOCALE_MAP[locale] || 'en') as 'en';

  return (
    <WalletUiContext.Provider value={{ uiState, setUiState, connectError, setConnectError }}>
      <RainbowKitProvider
        locale={rkLocale}
        appInfo={{
          appName: 'EnteleWALLET',
          learnMoreUrl: CANONICAL_APP_URL,
        }}
        theme={lightTheme({
          accentColor: '#1e40af',
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
          overlayBlur: 'large',
        })}
        modalSize="wide"
      >
        {children}
      </RainbowKitProvider>
    </WalletUiContext.Provider>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const config = useMemo(() => createEnteleWagmiConfig(), []);

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitInner>{children}</RainbowKitInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { isWalletConnectConfigured, walletConnectProjectId };
