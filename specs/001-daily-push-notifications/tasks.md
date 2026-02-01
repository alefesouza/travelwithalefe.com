# Tasks: Daily Push Notifications

**Input**: Design documents from `/specs/001-daily-push-notifications/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/fcm-payload.md

**Tests**: Tests are OPTIONAL for this feature. Manual verification with Firebase emulators is the testing approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/app/`, `public/`
- **Backend**: `functions/`
- This project extends existing files rather than creating new modules

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add translation strings and verify Firebase configuration

- [x] T001 Add push notification translation strings to src/app/utils/langs.js
- [x] T002 Verify FCM is enabled in Firebase Console (Settings > Cloud Messaging)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add push event handler to service worker in src/sw.js (handles incoming notifications)
- [x] T004 Add notificationclick event handler to service worker in src/sw.js (handles notification tap/click)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Enable Push Notifications (Priority: P1) 🎯 MVP

**Goal**: Users can subscribe to daily push notifications via a sidebar button

**Independent Test**: Visit website, click "Enable push notifications" button, grant permission, verify button disappears and localStorage shows `pushNotificationSubscribed: "true"`

### Implementation for User Story 1

- [x] T005 [US1] Add hidden "Enable push notifications" button to sidebar in src/app/components/sidebar/index.js (following "Add to Home Screen" pattern)
- [x] T006 [US1] Add pushNotifications object to public/app.js with capability detection logic
- [x] T007 [US1] Implement showEnableButton() function in public/app.js to show button when Push API supported and not subscribed
- [x] T008 [US1] Implement requestPermissionAndSubscribe() function in public/app.js with explanatory dialog
- [x] T009 [US1] Implement topic subscription logic in public/app.js (subscribe to daily-content-en or daily-content-pt based on domain)
- [x] T010 [US1] Implement localStorage state management in public/app.js (pushNotificationSubscribed, pushNotificationTopic keys)
- [x] T011 [US1] Wire up button click handler and initial visibility check in public/app.js

**Checkpoint**: Users can subscribe to notifications. Button shows/hides correctly based on state.

---

## Phase 4: User Story 2 - Receive Daily Random Content Notification (Priority: P1) 🎯 MVP

**Goal**: Subscribed users receive a daily push notification with random travel content at 3:00 PM UTC

**Independent Test**: Trigger scheduled function manually via Firebase Functions shell, verify notification received on subscribed device with correct content and link

### Implementation for User Story 2

- [x] T012 [US2] Add getMessaging import to functions/index.js
- [x] T013 [US2] Create getRandomMedia() helper function in functions/index.js to select random item from pages/random document
- [x] T014 [US2] Create mediaToUrl() helper function in functions/index.js to generate content URL from media object
- [x] T015 [US2] Create buildNotificationPayload() function in functions/index.js for English topic (daily-content-en)
- [x] T016 [US2] Create buildNotificationPayloadPt() function in functions/index.js for Portuguese topic (daily-content-pt) with name_pt fallbacks
- [x] T017 [US2] Create sendDailyNotification scheduled function in functions/index.js with onSchedule('0 15 * * *') for 3:00 PM UTC
- [x] T018 [US2] Implement notification send to both topics (daily-content-en and daily-content-pt) in sendDailyNotification function

**Checkpoint**: Daily notifications are sent at 3:00 PM UTC to all subscribers in their language.

---

## Phase 5: User Story 3 - Manage Notification Preferences (Priority: P2)

**Goal**: Users can unsubscribe from notifications via the website UI

**Independent Test**: Subscribed user clicks "Disable Notifications", verify button changes back to "Enable", localStorage updated, user no longer receives notifications

### Implementation for User Story 3

- [x] T019 [US3] Update sidebar button in src/app/components/sidebar/index.js to support both enable and disable states
- [x] T020 [US3] Add unsubscribeFromNotifications() function in public/app.js to unsubscribe from topic
- [x] T021 [US3] Update button state management in public/app.js to toggle between enable/disable based on subscription status
- [x] T022 [US3] Add translation strings for "Disable push notifications" in src/app/utils/langs.js

**Checkpoint**: Users can unsubscribe and re-subscribe to notifications via the UI.

---

## Phase 6: User Story 4 - Bilingual Notification Support (Priority: P2)

**Goal**: Users receive notifications in English or Portuguese based on their subscription domain

**Independent Test**: Subscribe from viajarcomale.com.br, verify notification arrives in Portuguese. Subscribe from travelwithalefe.com, verify notification arrives in English.

### Implementation for User Story 4

> Note: Most bilingual support is already integrated into US1 (topic selection) and US2 (payload building). This phase handles any remaining items.

- [x] T023 [US4] Verify topic selection logic in public/app.js correctly detects viajarcomale.com.br domain
- [x] T024 [US4] Verify Portuguese payload in functions/index.js uses name_pt with fallback to name for all fields

**Checkpoint**: Bilingual notifications work correctly for both domains.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation and final checks

- [x] T025 Run `npm run lint` and fix any linting errors
- [x] T026 Run `npm run build` and verify build succeeds
- [x] T027 Manual testing: Subscribe from localhost, trigger function manually, verify notification received
- [x] T028 Manual testing: Click notification and verify redirect to correct content page
- [x] T029 Deploy functions with `cd functions && npm run deploy`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority and can run in parallel
  - US3 depends on US1 (needs button to exist)
  - US4 is verification of US1 and US2 implementation
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Depends on US1 (extends the subscription button)
- **User Story 4 (P2)**: Verification of US1 and US2 implementation

### Within Each User Story

- Frontend changes before wiring up handlers
- Core implementation before state management
- State management before UI updates

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T003 and T004 can run in parallel (Phase 2 - different event handlers)
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational
- T012-T018 in US2 are sequential (each builds on previous)
- T025 and T026 can run in parallel (Phase 7)

---

## Parallel Example: Foundational Phase

```bash
# Launch both service worker handlers in parallel:
Task: "Add push event handler to service worker in src/sw.js"
Task: "Add notificationclick event handler to service worker in src/sw.js"
```

## Parallel Example: User Stories 1 and 2

```bash
# After Foundational, launch both P1 stories in parallel:
# Developer A: User Story 1 (Frontend subscription)
# Developer B: User Story 2 (Backend scheduled function)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Enable subscription)
4. Complete Phase 4: User Story 2 (Daily notifications)
5. **STOP and VALIDATE**: Test end-to-end flow
6. Deploy if ready - users can subscribe and receive notifications

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Users can subscribe (MVP part 1)
3. Add User Story 2 → Users receive notifications (MVP complete!)
4. Add User Story 3 → Users can unsubscribe
5. Add User Story 4 → Verify bilingual support
6. Each story adds value without breaking previous stories

---

## Notes

- [P] marker not heavily used as most tasks in each phase are sequential
- This feature extends existing files - no new file creation needed
- Tests are manual verification with Firebase emulators per plan.md
- FCM topic-based messaging eliminates need for token storage
- Bilingual support is built into US1 (topic selection) and US2 (payload generation)
