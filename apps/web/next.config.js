/** @type {import('next').NextConfig} */
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
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.entelewallet.app' }],
        destination: 'https://entelewallet.app/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'app.entelewallet.com' }],
        destination: 'https://entelewallet.app/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'wallet.entelekron.io' }],
        destination: 'https://entelewallet.app/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'entelewallet.org' }],
        destination: 'https://entelewallet.app/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
