# Feature Specification: Daily Push Notifications

**Feature Branch**: `001-daily-push-notifications`
**Created**: 2026-01-31
**Status**: Draft
**Input**: User description: "Build a push notifications system that sends notifications of random content (posts, stories, videos) everyday using Firebase Cloud Messaging"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Push Notifications (Priority: P1)

A visitor to the Travel with Alefe website wants to receive daily notifications featuring random travel content (photos, stories, videos) to stay engaged with the site without having to remember to visit.

**Why this priority**: This is the foundational user action - without notification opt-in, no notifications can be sent. This enables the entire feature's value proposition.

**Independent Test**: Can be fully tested by visiting the website, granting notification permission, and verifying the subscription is recorded. Delivers immediate value by confirming user intent.

**Acceptance Scenarios**:

1. **Given** a user visits the website on a device that supports push notifications, **When** the page loads, **Then** an "Enable push notifications" button appears in the sidebar (similar to "Add to Home Screen" button).
2. **Given** a user's browser does not support push notifications, **When** the page loads, **Then** the button remains hidden.
3. **Given** the button is visible, **When** the user clicks it, **Then** a dialog appears explaining "By enabling push notifications, you will receive a notification with random content every day" while the browser's permission prompt is shown.
4. **Given** a user grants notification permission, **When** the permission is accepted, **Then** their device is subscribed and the dialog confirms success.
5. **Given** a user denies notification permission, **When** the permission is denied, **Then** the system respects this choice and hides the button.
6. **Given** a user has previously enabled notifications, **When** they revisit the site, **Then** the enable button is hidden (they are already subscribed).

---

### User Story 2 - Receive Daily Random Content Notification (Priority: P1)

A subscribed user receives a daily push notification showcasing a random piece of travel content, enticing them to visit the website and explore.

**Why this priority**: This is the core value delivery - users subscribed to notifications expect daily content. Without this, the opt-in has no purpose.

**Independent Test**: Can be tested by triggering the scheduled function manually and verifying a notification is received on a subscribed device with the correct content preview and link.

**Acceptance Scenarios**:

1. **Given** a user has subscribed to push notifications, **When** the daily notification is sent, **Then** the user receives a notification on their device.
2. **Given** the notification is received, **When** the user views it, **Then** it displays a thumbnail image, the content title/description, and the site name.
3. **Given** the user receives a notification, **When** they tap/click on it, **Then** they are taken directly to the featured content on the website.
4. **Given** multiple content types exist (posts, stories, videos), **When** the daily notification is generated, **Then** any content type can be randomly selected.

---

### User Story 3 - Manage Notification Preferences (Priority: P2)

A user who previously enabled notifications wants to disable them without having to dig through browser settings.

**Why this priority**: Important for user control and trust, but not required for core functionality. Users can always use browser settings as a fallback.

**Independent Test**: Can be tested by having a subscribed user click "Disable Notifications" and verifying they no longer receive notifications.

**Acceptance Scenarios**:

1. **Given** a user has notifications enabled, **When** they visit the site, **Then** they see an option to disable notifications.
2. **Given** a user clicks "Disable Notifications", **When** the action completes, **Then** their subscription is removed and they receive confirmation.
3. **Given** a user has disabled notifications, **When** they change their mind, **Then** they can re-enable notifications with a single click.

---

### User Story 4 - Bilingual Notification Support (Priority: P2)

Users of both travelwithalefe.com (English) and viajarcomale.com.br (Portuguese) receive notifications in their respective language.

**Why this priority**: Essential for user experience consistency across both sites, but the core notification system can work with a single language initially.

**Independent Test**: Can be tested by subscribing from each domain and verifying notifications arrive in the correct language.

**Acceptance Scenarios**:

1. **Given** a user subscribes from viajarcomale.com.br, **When** they receive a notification, **Then** the notification text is in Portuguese.
2. **Given** a user subscribes from any other domain (including travelwithalefe.com), **When** they receive a notification, **Then** the notification text is in English.
3. **Given** content has both English and Portuguese descriptions, **When** a notification is sent, **Then** the appropriate language version is used based on whether the subscription originated from viajarcomale.com.br (Portuguese) or elsewhere (English).

---

### Edge Cases

- What happens when a user subscribes on multiple devices? Each device receives the notification independently.
- What happens if no content is available in the random pool? The system logs an error and skips sending for that day (should not happen in production as content always exists).
- What happens if the user's browser doesn't support push notifications? The enable button is hidden.
- What happens if the notification image fails to load? The notification displays with a fallback icon (site logo).
- What happens if a user's token becomes invalid? FCM automatically handles token lifecycle for topic subscriptions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an "Enable push notifications" button in the sidebar, following the same pattern as "Add to Home Screen" (hidden by default, shown via JavaScript when browser supports it)
- **FR-002**: System MUST show an explanatory dialog when the user clicks enable, informing them they will receive daily random content notifications
- **FR-003**: System MUST hide the enable button when browser doesn't support push notifications, user already subscribed, or user previously denied permission
- **FR-004**: System MUST subscribe users to a notification topic upon granting permission (FCM handles token storage)
- **FR-005**: System MUST send one push notification per day at 3:00 PM UTC to the topic (single API call delivers to all subscribers)
- **FR-006**: System MUST select random content for each notification from all available types (posts, stories, short-videos, videos, 360-photos)
- **FR-007**: System MUST include an image preview, title, and deep link in each notification
- **FR-008**: System MUST support both languages by using separate topics for English and Portuguese subscribers
- **FR-009**: System MUST allow users to unsubscribe from notifications via the website UI
- **FR-010**: System MUST handle the push notification events within the existing service worker
- **FR-011**: System MUST rely on FCM to handle token lifecycle (invalid tokens automatically removed from topics)
- **FR-012**: System MUST respect user's browser notification permission settings

### Key Entities

- **Notification Topic**: A channel users subscribe to (e.g., "daily-content-en", "daily-content-pt"). FCM manages all subscribed tokens automatically.
- **Notification Content**: The randomly selected travel content for a notification. Key attributes: content URL, title (localized), description (localized), thumbnail image URL, content type.

### Assumptions

- Users have modern browsers that support the Push API and Service Workers (Chrome, Firefox, Edge, Safari 16+)
- The existing service worker (Serwist-based) can be extended without requiring a complete rewrite
- The `pages/random` Firestore document contains a representative sample of all content types
- One notification per day is sufficient; no user preference for notification frequency is needed
- Notification timing will be set to a fixed time of 3:00 PM UTC (15:00 UTC) for all users globally
- The Firebase project already has Cloud Messaging enabled
- The UI pattern follows the existing "Add to Home Screen" approach: button in sidebar, hidden by default, shown via JavaScript based on browser capability
- Topic-based messaging is used: users subscribe to a topic, and a single send to the topic delivers to all subscribers (no token management needed)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can enable push notifications with a single click from the sidebar button
- **SC-002**: 95% of sent notifications are delivered successfully (measured via FCM delivery reports)
- **SC-003**: Notification click-through leads directly to the featured content within 3 seconds of page load
- **SC-004**: The daily notification job completes within 60 seconds, even with 10,000+ subscribers
- **SC-005**: Notification content displays correctly on both mobile and desktop devices
- **SC-006**: Both English and Portuguese site visitors receive notifications in their expected language
