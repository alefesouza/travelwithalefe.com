const fs = require('fs');
const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'serviceworker.js',
  register: false,
  runtimeCaching: require('./src/cache'),
});

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'travelwithalefe.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'viajarcomale.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  },
  exclude: [
    ({ asset }) => {
      if (
        asset.name.startsWith('server/') ||
        asset.name.match(/^((app-|^)build-manifest\.json)$/)
      ) {
        return true;
      }
      if (isDev && !asset.name.startsWith('static/runtime/')) {
        return true;
      }
      return false;
    },
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
});

module.exports = nextConfig;
