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
};

module.exports = nextConfig;
