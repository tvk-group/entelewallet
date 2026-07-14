import { Inter, JetBrains_Mono } from 'next/font/google';
import { Web3Provider } from '@/lib/web3-provider';
import { I18nProvider } from '@/lib/i18n-context';
import { AuthProvider } from '@/lib/auth-context';
import { WalletProvider } from '@/lib/wallet-context';
import { NetworkViewProvider } from '@/lib/network-view-context';
import { SEO_DEFAULT, BRAND_ASSETS } from '@entelewallet/config';
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
  icons: {
    icon: [
      { url: BRAND_ASSETS.favicon16, sizes: '16x16', type: 'image/png' },
      { url: BRAND_ASSETS.favicon32, sizes: '32x32', type: 'image/png' },
      { url: BRAND_ASSETS.icon192, sizes: '192x192', type: 'image/png' },
    ],
    apple: BRAND_ASSETS.appleTouchIcon,
    shortcut: BRAND_ASSETS.favicon32,
  },
  openGraph: {
    title: SEO_DEFAULT.title,
    description: SEO_DEFAULT.description,
    images: [{ url: SEO_DEFAULT.ogImage, width: 1200, height: 630, alt: 'EnteleWALLET' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULT.title,
    description: SEO_DEFAULT.description,
    images: [SEO_DEFAULT.ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`app-shell-bg ${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <I18nProvider>
          <Web3Provider>
            <AuthProvider>
              <WalletProvider>
                <NetworkViewProvider>{children}</NetworkViewProvider>
              </WalletProvider>
            </AuthProvider>
          </Web3Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
