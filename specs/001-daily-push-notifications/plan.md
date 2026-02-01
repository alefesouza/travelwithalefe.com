# Implementation Plan: Daily Push Notifications

**Branch**: `001-daily-push-notifications` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-daily-push-notifications/spec.md`

## Summary

Implement a daily push notification system that sends random travel content to subscribed users using Firebase Cloud Messaging (FCM) with topic-based messaging. Users subscribe via a sidebar button (following the "Add to Home Screen" pattern), and a scheduled Cloud Function sends one notification per day at 3:00 PM UTC to all subscribers. Bilingual support is achieved through separate topics for English and Portuguese users.

## Technical Context

**Language/Version**: JavaScript/Node.js 20 (Cloud Functions), Next.js 16 with React 19 (Frontend)
**Primary Dependencies**: Firebase Admin SDK 13.x, Firebase Functions 6.x, Serwist 9.x, firebase-admin/messaging
**Storage**: Firestore (`pages/random` for content pool), FCM Topics (subscription management)
**Testing**: Manual verification with Firebase emulators, `npm run build` validation
**Target Platform**: Web (Chrome, Firefox, Edge, Safari 16+), PWA
**Project Type**: Web application (Next.js App Router + Firebase Cloud Functions)
**Performance Goals**: Notification job completes within 60 seconds for 10,000+ subscribers
**Constraints**: Must integrate with existing Serwist service worker, follow existing UI patterns
**Scale/Scope**: Bilingual support (EN/PT), single daily notification globally at 15:00 UTC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality** | ✅ PASS | Follows existing patterns (sidebar button, scheduled functions, service worker) |
| **II. Testing Standards** | ✅ PASS | Tests optional; will use `npm run build` + manual verification with emulators |
| **III. User Experience Consistency** | ✅ PASS | Bilingual parity (EN/PT topics), follows "Add to Home Screen" UI pattern, mobile-first |
| **IV. Performance Requirements** | ✅ PASS | Topic-based FCM (single API call), no Firestore token storage, lazy dialog loading |

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-push-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── fcm-payload.md   # FCM message payload specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Frontend (Next.js)
src/
├── app/
│   ├── components/
│   │   └── sidebar/
│   │       └── index.js           # Add push notification button (existing file)
│   └── utils/
│       └── langs.js               # Add translation strings (existing file)
├── sw.js                          # Extend with FCM push handlers (existing file)
└── cache.js                       # No changes needed

public/
└── app.js                         # Add push notification logic (existing file)

# Backend (Firebase Cloud Functions)
functions/
├── index.js                       # Add scheduled notification function (existing file)
└── package.json                   # Add firebase-admin/messaging if needed (existing file)
```

**Structure Decision**: This feature extends existing files rather than creating new modules. The sidebar button follows the established pattern in `sidebar/index.js`, the scheduled function follows patterns in `functions/index.js`, and push handling extends the existing Serwist service worker in `src/sw.js`.

## Complexity Tracking

> **No violations to justify** - Implementation follows existing patterns with minimal new complexity.
