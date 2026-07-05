'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import { ReactNode, useState, createContext, useContext } from 'react';
import { useI18n } from '@/lib/i18n-context';
import type { LocaleCode } from '@entelewallet/i18n';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const chains =
  process.env.NODE_ENV === 'development'
    ? ([mainnet, base, sepolia] as const)
    : ([mainnet, base] as const);

const config = getDefaultConfig({
  appName: 'EnteleWALLET',
  projectId: projectId || '00000000000000000000000000000000',
  chains,
  ssr: true,
});

const RK_LOCALE_MAP: Partial<Record<LocaleCode, string>> = {
  en: 'en', de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt', nl: 'nl',
  ru: 'ru', ja: 'ja', ko: 'ko', zh: 'zh', tr: 'tr', ar: 'ar',
};

type WalletUiState =
  | 'idle'
  | 'wallet_modal_open'
  | 'connecting'
  | 'connected'
  | 'connection_failed'
  | 'unsupported_wallet'
  | 'wrong_network';

const WalletUiContext = createContext<{
  uiState: WalletUiState;
  setUiState: (s: WalletUiState) => void;
}>({ uiState: 'idle', setUiState: () => {} });

export function useWalletUi() {
  return useContext(WalletUiContext);
}

function RainbowKitInner({ children }: { children: ReactNode }) {
  const { locale } = useI18n();
  const [uiState, setUiState] = useState<WalletUiState>('idle');
  const rkLocale = (RK_LOCALE_MAP[locale] || 'en') as 'en';

  return (
    <WalletUiContext.Provider value={{ uiState, setUiState }}>
      <RainbowKitProvider
        locale={rkLocale}
        theme={lightTheme({
          accentColor: '#0ea5e9',
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WalletUiContext.Provider>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitInner>{children}</RainbowKitInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export const walletConnectProjectId = projectId;
export const isWalletConnectConfigured = Boolean(projectId);
