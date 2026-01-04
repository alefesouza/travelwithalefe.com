import { NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'serwist';

// Workbox RuntimeCaching config: https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.RuntimeCachingEntry
export default [
  {
    matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    }),
  },
  {
    matcher: /\/_next\/image\?url=.+$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'next-image',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    }),
  },
  {
    matcher: /\.(?:js)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'static-js-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    }),
  },
  {
    matcher: /\.(?:css|less)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'static-style-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    }),
  },
  {
    matcher: /\/_next\/data\/.+\/.+\.json$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'next-data',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    }),
  },
  {
    matcher: /\.(?:json|xml|csv)$/i,
    handler: new NetworkFirst({
      cacheName: 'static-data-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    }),
  },
  {
    matcher: '/api/random',
    handler: new NetworkOnly(),
  },
  {
    matcher: '/api/random-videos',
    handler: new NetworkOnly(),
  },
  {
    matcher: '/videos',
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => {
      const isSameOrigin = self.origin === url.origin;
      if (!isSameOrigin) return false;
      const pathname = url.pathname;
      // Exclude /api/auth/callback/* to fix OAuth workflow in Safari without impact other environment
      // Above route is default for next-auth, you may need to change it if your OAuth workflow has a different callback route
      // Issue: https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809
      if (pathname.startsWith('/api/auth/')) return false;
      if (pathname.startsWith('/api/')) return true;
      return false;
    },
    handler: new NetworkFirst({
      cacheName: 'apis',
      expiration: {
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      networkTimeoutSeconds: 10, // fall back to cache if api does not response within 10 seconds
    }),
  },
  {
    matcher: ({ url }) => {
      const isSameOrigin = self.origin === url.origin;
      if (!isSameOrigin) return false;
      const pathname = url.pathname;
      if (pathname.startsWith('/api/')) return false;
      return true;
    },
    handler: new NetworkFirst({
      cacheName: 'others',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      networkTimeoutSeconds: 10,
    }),
  },
  // {
  //   matcher: () => {
  //     return false;
  //   },
  //   handler: new NetworkFirst({
  //     cacheName: 'cross-origin',
  //     expiration: {
  //       maxEntries: 32,
  //       maxAgeSeconds: 60 * 60, // 1 hour
  //     },
  //     networkTimeoutSeconds: 10,
  //   }),
  // },
];
