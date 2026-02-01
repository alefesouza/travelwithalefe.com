# Quickstart: Daily Push Notifications

**Feature**: 001-daily-push-notifications
**Date**: 2026-01-31

## Prerequisites

- Node.js 20+
- Firebase CLI installed (`npm install -g firebase-tools`)
- Access to Firebase project (viajarcomale)
- FCM enabled in Firebase Console (Settings > Cloud Messaging)

## Local Development Setup

### 1. Start the Development Environment

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Firebase emulators (functions only, connects to production Firestore)
firebase emulators:start --only functions
```

### 2. Verify FCM is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Cloud Messaging
2. Confirm Cloud Messaging API is enabled
3. No additional configuration needed - FCM handles VAPID keys automatically for topic-based messaging

## Testing the Feature

### Test Push Notification Subscription (Frontend)

1. Open http://localhost:3000 in Chrome/Firefox
2. Scroll to sidebar, find "Enable push notifications" button
3. Click the button
4. Observe: Dialog appears explaining daily notifications
5. Grant permission in browser prompt
6. Verify: Button disappears, localStorage shows `pushNotificationSubscribed: "true"`

### Test Daily Notification Function (Backend)

```bash
# Using Firebase Functions shell
cd functions
firebase functions:shell

# In the shell, trigger the function manually
sendDailyNotification()
```

Or use the Firebase Console:
1. Go to Functions > sendDailyNotification
2. Click "Run in test mode"

### Verify Notification Received

1. Keep the website open in a tab (or install as PWA)
2. Trigger the function
3. Observe: Push notification appears with travel content
4. Click notification
5. Verify: Redirects to the content page

## Key Files to Modify

| File | Purpose |
|------|---------|
| `src/app/components/sidebar/index.js` | Add push notification button |
| `public/app.js` | Add push subscription logic |
| `src/sw.js` | Add push event handlers |
| `functions/index.js` | Add scheduled notification function |
| `src/app/utils/langs.js` | Add translation strings |

## Validation Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Button appears only when Push API supported
- [ ] Button hidden after subscription
- [ ] Button hidden if permission denied
- [ ] Notifications work on travelwithalefe.com (English)
- [ ] Notifications work on viajarcomale.com.br (Portuguese)
- [ ] Clicking notification opens correct content page
- [ ] Function executes successfully in emulator

## Troubleshooting

### Button doesn't appear

```javascript
// Check in browser console:
console.log('Notification in window:', 'Notification' in window);
console.log('Permission:', Notification.permission);
console.log('Service Worker:', 'serviceWorker' in navigator);
```

### Notifications not received

1. Check if service worker is registered: DevTools > Application > Service Workers
2. Verify FCM token is generated: Check console for FCM registration
3. Test with Firebase Console: Messaging > Send test message

### Function errors

```bash
# Check function logs
firebase functions:log --only sendDailyNotification
```

## Deployment

```bash
# Deploy Cloud Functions
cd functions
npm run deploy

# Deploy frontend (automatic via Firebase App Hosting on push to main)
git push origin main
```

## Monitoring

- **FCM Delivery Reports**: Firebase Console > Cloud Messaging > Reports
- **Function Logs**: Firebase Console > Functions > Logs
- **Error Tracking**: Check Cloud Functions logs for failed sends
