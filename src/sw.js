import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';
import cache from './cache';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [...defaultCache, ...cache],
  fallbacks: {
    entries: [
      {
        url: '/',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
