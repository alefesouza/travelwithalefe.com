# Data Model: Daily Push Notifications

**Feature**: 001-daily-push-notifications
**Date**: 2026-01-31

## Overview

This feature uses FCM topic-based messaging, which means **no new Firestore collections are required**. FCM manages topic subscriptions internally. The only data interactions are:

1. **Reading** from existing `pages/random` document for content selection
2. **Client-side** localStorage for tracking subscription state

## Existing Data (Read Only)

### Firestore: `pages/random`

**Purpose**: Cached pool of random media items for content selection

**Structure** (existing):
```javascript
{
  value: [
    {
      id: "lisbon-post-2024-01-15-1",
      type: "post",              // post | story | youtube | short-video | 360photo | maps
      city: "lisbon",
      country: "portugal",
      cityData: {
        name: "Lisbon",
        name_pt: "Lisboa",
        slug: "lisbon"
      },
      countryData: {
        name: "Portugal",
        name_pt: "Portugal",
        slug: "portugal",
        iso: "PT"
      },
      description: "Beautiful view from...",
      description_pt: "Vista linda de...",
      file: "portugal/lisbon/posts/2024-01-15-1.jpg",
      // ... other media fields
    },
    // ... more media items
  ]
}
```

**Access Pattern**: Read single random item from `value` array

## FCM Topics (Managed by Firebase)

### Topic: `daily-content-en`

**Purpose**: English notification subscribers

**Subscribers**: Users who enabled notifications from any domain except `viajarcomale.com.br`

**Subscription**: Client-side via FCM SDK `messaging.subscribeToTopic()`

### Topic: `daily-content-pt`

**Purpose**: Portuguese notification subscribers

**Subscribers**: Users who enabled notifications from `viajarcomale.com.br`

**Subscription**: Client-side via FCM SDK `messaging.subscribeToTopic()`

## Client-Side State (localStorage)

### Key: `pushNotificationSubscribed`

**Purpose**: Track whether user has subscribed to avoid showing button again

**Values**:
- `"true"` - User has subscribed
- `"false"` or not set - User has not subscribed
- `"denied"` - User denied permission

**Structure**:
```javascript
localStorage.setItem('pushNotificationSubscribed', 'true');
```

### Key: `pushNotificationTopic`

**Purpose**: Track which topic the user subscribed to (for potential unsubscribe)

**Values**: `"daily-content-en"` or `"daily-content-pt"`

## State Transitions

```
┌─────────────────┐
│   Not Shown     │ ← Browser doesn't support Push API
└─────────────────┘

┌─────────────────┐
│  Button Visible │ ← Push supported, not subscribed, not denied
└────────┬────────┘
         │ User clicks
         ▼
┌─────────────────┐
│ Dialog + Prompt │ ← Show explanation, request permission
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────┐
│Granted│ │ Denied │
└───┬───┘ └────┬───┘
    │          │
    ▼          ▼
┌─────────┐ ┌─────────────┐
│Subscribe│ │Button Hidden│
│to Topic │ │(denied=true)│
└────┬────┘ └─────────────┘
     │
     ▼
┌──────────────────┐
│ Button Hidden    │
│ (subscribed=true)│
└──────────────────┘
```

## Notification Payload Structure

See [contracts/fcm-payload.md](./contracts/fcm-payload.md) for the FCM message payload specification.
