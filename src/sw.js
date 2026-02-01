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

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const labels = {
    body:
      data.data?.lang === 'pt-BR'
        ? 'Novo conteúdo disponível!'
        : 'New content available!',
    short_videos:
      data.data?.lang === 'pt-BR' ? 'Vídeos curtos' : 'Short Videos',
    random_post: data.data?.lang === 'pt-BR' ? 'Post aleatório' : 'Random Post',
  };

  const options = {
    body: data.notification?.body || labels.body,
    icon:
      // Use only if Notification API supports 'image' property (macOS does not support it)
      ('image' in Notification.prototype
        ? data.notification?.icon
        : data.notification?.image) || '/icons/192x192.png',
    badge: '/icons/96x96.png',
    image: data.notification?.image,
    data: {
      url: data.data?.url || '/',
    },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'short_videos', title: labels.short_videos },
      { action: 'random_post', title: labels.random_post },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.notification?.title || 'Travel with Alefe',
      options,
    ),
  );
});

// Notification click handler
self.addEventListener('notificationclick', async (event) => {
  event.notification.close();

  let urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'short_videos') {
    urlToOpen = '/videos';
  } else if (event.action === 'random_post') {
    const randomResponse = await fetch('/api/random');
    const randomData = await randomResponse.json();
    urlToOpen = randomData.url || '/';
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      }),
  );
});
