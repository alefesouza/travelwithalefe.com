# Research: Daily Push Notifications

**Feature**: 001-daily-push-notifications
**Date**: 2026-01-31

## FCM Messaging Approach

**Decision**: Use FCM topic-based messaging with two topics (`daily-content-en`, `daily-content-pt`)

**Rationale**:
- Single API call to send notification to all subscribers (no loops, no token management)
- FCM automatically handles token lifecycle (invalid tokens removed from topics)
- No need to store tokens in Firestore, reducing storage costs and complexity
- Bilingual support achieved through separate topic subscriptions based on domain

**Alternatives considered**:
- **Token-based multicast**: Would require storing tokens in Firestore, managing token refresh, batch sending in chunks of 500. Rejected for added complexity.
- **Single topic with conditional payload**: FCM doesn't support conditional content per subscriber. Rejected.
- **Firebase Cloud Messaging v1 API directly**: Would bypass Firebase Admin SDK patterns. Rejected for inconsistency with existing codebase.

## Service Worker Integration

**Decision**: Extend existing Serwist service worker (`src/sw.js`) with FCM push event handlers

**Rationale**:
- Serwist uses standard service worker APIs; FCM push events are compatible
- Avoids creating a separate service worker (browsers allow only one per scope)
- Follows progressive enhancement - FCM push handlers are additive
- Can use `self.addEventListener('push', ...)` alongside Serwist's `addEventListeners()`

**Alternatives considered**:
- **Separate FCM service worker**: Would conflict with existing Serwist SW. Rejected.
- **Replace Serwist with Workbox + FCM plugin**: Breaking change, unnecessary. Rejected.

## UI Pattern for Enable Button

**Decision**: Add hidden button in sidebar, show via JavaScript when Push API is supported

**Rationale**:
- Follows existing "Add to Home Screen" pattern exactly
- Button hidden by default (`display: none`), shown when `'Notification' in window && Notification.permission !== 'denied'`
- User already subscribed check: verify topic subscription state in localStorage
- Consistent with existing `public/app.js` capability detection patterns

**Alternatives considered**:
- **Modal prompt on first visit**: Intrusive, poor UX. Rejected.
- **Floating action button**: Inconsistent with site design. Rejected.
- **Settings page**: Too hidden, low discoverability. Rejected.

## Topic Naming Convention

**Decision**: Use `daily-content-en` and `daily-content-pt` as topic names

**Rationale**:
- Clear, descriptive naming following FCM topic naming rules (alphanumeric + hyphens)
- Language suffix enables future expansion (e.g., `daily-content-es`)
- Domain-based subscription: `viajarcomale.com.br` → `daily-content-pt`, all others → `daily-content-en`

**Alternatives considered**:
- **Single topic with user preferences**: FCM doesn't support this. Rejected.
- **Country-based topics**: Overkill for current bilingual setup. Rejected.

## Notification Timing

**Decision**: 3:00 PM UTC (15:00 UTC) daily

**Rationale**:
- User-specified preference
- Good coverage for European afternoon (4-5 PM CET) and Brazilian midday (12 PM BRT)
- Single global time simplifies implementation (no timezone handling)

**Alternatives considered**:
- **User-selectable time**: Requires storing preferences, complex scheduling. Rejected for MVP.
- **Time-zone aware delivery**: Requires user location, complex logic. Rejected for MVP.

## Random Content Selection

**Decision**: Reuse existing `pages/random` Firestore document containing cached random media IDs

**Rationale**:
- Document already exists and is populated with representative content
- Same source used by `/api/random` endpoint
- Contains all content types (posts, stories, videos, short-videos, 360-photos)
- Uses `mediaToUrl()` utility for consistent URL generation

**Alternatives considered**:
- **Query Firestore directly with random ordering**: Expensive, slow. Rejected.
- **Separate random pool for notifications**: Duplication, maintenance overhead. Rejected.

## Dialog Implementation

**Decision**: Simple browser `alert()` or custom modal showing explanation before permission prompt

**Rationale**:
- User requested explanatory dialog: "By enabling push notifications, you will receive a notification with random content every day"
- Can use existing `utils.showAlert()` pattern from `public/app.js` for bilingual messages
- Shows simultaneously with browser's native permission prompt

**Alternatives considered**:
- **No dialog, direct permission prompt**: Less context for user. Rejected per user requirement.
- **Complex modal component**: Over-engineering for simple message. Rejected.

## Firebase Configuration

**Decision**: Use existing Firebase Admin SDK initialization, add messaging import

**Rationale**:
- `firebase-admin` already initialized in `functions/index.js`
- Just need to import `getMessaging` from `firebase-admin/messaging`
- No additional configuration required; FCM is enabled by default in Firebase projects

**Alternatives considered**:
- **Separate Firebase app for messaging**: Unnecessary complexity. Rejected.
