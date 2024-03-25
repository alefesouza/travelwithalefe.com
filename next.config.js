const fs = require('fs');
const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'serviceworker.js',
  register: false,
  runtimeCaching: require('./src/cache'),
});

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
  env: {
    rawAppJsFile: fs.readFileSync('./public/app.js').toString(),
  },
});

module.exports = nextConfig;
