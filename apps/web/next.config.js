/** @type {import('next').NextConfig} */

const MARKETING_REDIRECT_PATHS = [
  '/roadmap',
  '/ecosystem',
  '/legal',
  '/privacy',
  '/terms',
  '/risk',
  '/disclaimer',
];

const marketingUrl = (process.env.NEXT_PUBLIC_MARKETING_URL || 'https://entelewallet.com').replace(
  /\/$/,
  '',
);

const marketingRedirects = MARKETING_REDIRECT_PATHS.map((source) => ({
  source,
  destination: `${marketingUrl}${source}`,
  permanent: true,
}));

const nextConfig = {
  transpilePackages: [
    '@entelewallet/ui',
    '@entelewallet/config',
    '@entelewallet/i18n',
    '@entelewallet/security',
    '@entelewallet/blockchain',
    '@entelewallet/wallet-core',
    '@entelewallet/utils',
    '@entelewallet/types',
  ],
  images: {
    unoptimized: true,
  },
  async redirects() {
    return marketingRedirects;
  },
};

module.exports = nextConfig;
