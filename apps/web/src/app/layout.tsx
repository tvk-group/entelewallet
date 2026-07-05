import { Inter, JetBrains_Mono } from 'next/font/google';
import { Web3Provider } from '@/lib/web3-provider';
import { I18nProvider } from '@/lib/i18n-context';
import { WalletProvider } from '@/lib/wallet-context';
import { SEO_DEFAULT } from '@entelewallet/config';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: SEO_DEFAULT.title,
  description: SEO_DEFAULT.description,
  openGraph: {
    title: SEO_DEFAULT.title,
    description: SEO_DEFAULT.description,
    images: [{ url: SEO_DEFAULT.ogImage, width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <I18nProvider>
          <Web3Provider>
            <WalletProvider>{children}</WalletProvider>
          </Web3Provider>
        </I18nProvider>
      </body>
    </html>
  );
}
