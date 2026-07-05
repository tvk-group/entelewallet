import { Inter, JetBrains_Mono } from 'next/font/google';
import { Web3Provider } from '@/lib/web3-provider';
import { I18nProvider } from '@/lib/i18n-context';
import { WalletProvider } from '@/lib/wallet-context';
import { SEO_DEFAULT } from '@entelewallet/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://entelewallet.app'),
  title: SEO_DEFAULT.title,
  description: SEO_DEFAULT.description,
  applicationName: 'EnteleWALLET',
  appleWebApp: { capable: true, title: 'EnteleWALLET' },
  themeColor: '#0ea5e9',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: SEO_DEFAULT.title,
    description: SEO_DEFAULT.description,
    images: [{ url: SEO_DEFAULT.ogImage, width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`app-shell-bg ${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <I18nProvider>
          <Web3Provider>
            <WalletProvider>{children}</WalletProvider>
          </Web3Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
