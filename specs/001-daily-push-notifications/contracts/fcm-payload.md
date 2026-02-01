# FCM Payload Contract: Daily Push Notifications

**Feature**: 001-daily-push-notifications
**Date**: 2026-01-31

## Topic Message Payload

### English Topic (`daily-content-en`)

```javascript
{
  topic: 'daily-content-en',
  notification: {
    title: 'Travel with Alefe',
    body: 'Place: {location_name}, City: {city_name}, {country_name}',
    imageUrl: 'https://storage.googleapis.com/files.viajarcomale.com/resize/500/{file_path}'
  },
  webpush: {
    fcmOptions: {
      link: 'https://travelwithalefe.com{content_url}'
    },
    notification: {
      icon: 'https://travelwithalefe.com/icons/192x192.png',
      badge: 'https://travelwithalefe.com/icons/96x96.png'
    }
  },
  data: {
    url: '{content_url}',
    contentType: '{type}',
    contentId: '{id}'
  }
}
```

### Portuguese Topic (`daily-content-pt`)

```javascript
{
  topic: 'daily-content-pt',
  notification: {
    title: 'Viajar com Alê',
    body: 'Local: {location_name}, Cidade: {city_name}, {country_name}',
    imageUrl: 'https://storage.googleapis.com/files.viajarcomale.com/resize/500/{file_path}'
  },
  webpush: {
    fcmOptions: {
      link: 'https://viajarcomale.com.br{content_url}'
    },
    notification: {
      icon: 'https://viajarcomale.com.br/icons/192x192.png',
      badge: 'https://viajarcomale.com.br/icons/96x96.png'
    }
  },
  data: {
    url: '{content_url}',
    contentType: '{type}',
    contentId: '{id}'
  }
}
```

## Field Mapping

### English Fields

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{location_name}` | `media.location_data.map(l => l.name).join(', ')` | "Belém Tower, Jerónimos Monastery" |
| `{city_name}` | `media.cityData.name` | "Lisbon" |
| `{country_name}` | `media.countryData.name` | "Portugal" |
| `{file_path}` | `media.file` | "portugal/lisbon/posts/2024-01-15-1.jpg" |
| `{content_url}` | Generated via `mediaToUrl(media)` | "/countries/portugal/cities/lisbon/posts/2024-01-15-1" |
| `{type}` | `media.type` | "post" |
| `{id}` | `media.id` | "lisbon-post-2024-01-15-1" |

### Portuguese Fields (with fallback)

| Placeholder | Source | Example |
|-------------|--------|---------|
| `{location_name}` | `media.location_data.map(l => l.name_pt \|\| l.name).join(', ')` | "Torre de Belém, Mosteiro dos Jerónimos" |
| `{city_name}` | `media.cityData.name_pt \|\| media.cityData.name` | "Lisboa" |
| `{country_name}` | `media.countryData.name_pt \|\| media.countryData.name` | "Portugal" |

## Service Worker Push Event Handler

```javascript
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.notification?.body || 'New content available!',
    icon: data.notification?.icon || '/icons/192x192.png',
    badge: '/icons/96x96.png',
    image: data.notification?.image,
    data: {
      url: data.data?.url || '/'
    },
    vibrate: [100, 50, 100],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(
      data.notification?.title || 'Travel with Alefe',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        return clients.openWindow(urlToOpen);
      })
  );
});
```

## Firebase Admin SDK Usage

```javascript
const { getMessaging } = require('firebase-admin/messaging');

async function sendDailyNotification(topic, payload) {
  const messaging = getMessaging();

  const message = {
    topic: topic,
    notification: payload.notification,
    webpush: payload.webpush,
    data: payload.data
  };

  const response = await messaging.send(message);
  console.log(`Successfully sent notification to topic ${topic}:`, response);
  return response;
}
```

## Error Handling

| Error | Action |
|-------|--------|
| `messaging/invalid-registration-token` | FCM handles automatically for topics |
| `messaging/registration-token-not-registered` | FCM handles automatically for topics |
| No content in random pool | Log error, skip notification for the day |
| FCM service unavailable | Retry with exponential backoff (up to 3 attempts) |
