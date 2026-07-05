'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { mainnet, base, sepolia } from 'wagmi/chains';
import { ReactNode, useState } from 'react';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const chains =
  process.env.NODE_ENV === 'development'
    ? ([mainnet, base, sepolia] as const)
    : ([mainnet, base] as const);

const config = getDefaultConfig({
  appName: 'EnteleWALLET Lite',
  projectId: projectId || '00000000000000000000000000000000',
  chains,
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: '#0891b2',
              accentColorForeground: 'white',
              borderRadius: 'medium',
            }),
            darkMode: darkTheme({ accentColor: '#0891b2' }),
          }}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { projectId as walletConnectProjectId };
