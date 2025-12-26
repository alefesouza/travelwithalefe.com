import { spawnSync } from 'node:child_process';
import withSerwistInit from '@serwist/next';

// Using `git rev-parse HEAD` might not the most efficient
// way of determining a revision. You may prefer to use
// the hashes of every extra file you precache.
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout ??
  crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: '/', revision }],
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: 'src/sw.js',
  swDest: 'public/sw.js',
});

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
export default withSerwist({
  reactStrictMode: false,
  serverExternalPackages: ['esbuild-wasm'],
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
