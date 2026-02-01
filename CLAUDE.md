# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Travel with Alefe - a travel photo/video hub website that aggregates content from Instagram archives, organizing it by country, city, location, and hashtag. Features include an interactive map, hashtag cloud, discount coupons page, TikTok-style vertical video feed, and random post functionality.

- **English site**: travelwithalefe.com
- **Portuguese site**: viajarcomale.com.br (same codebase, domain-based locale)

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

# Firebase Emulators
firebase emulators:start                   # All emulators (Firestore, Functions, App Hosting)
firebase emulators:start --only hosting    # App Hosting only (connects to production Firestore)
firebase emulators:start --only functions  # Functions emulator only

# Cloud Functions (from /functions directory)
cd functions && npm run deploy  # Deploy functions to Firebase
```

## Architecture

### Next.js App Router Structure (`src/app/`)
- Uses dynamic routes with nested structure: `/countries/[country]/cities/[city]/{posts|stories|short-videos|videos|360-photos|locations}/[media]`
- Catch-all routes (`[...slug]`, `[[...stories]]`) handle various content types
- Route handlers (`route.js`) for API endpoints: `/rss/`, `/medias/`, `/api/random`, `/api/random-videos`

### Internationalization
Locale determined by `NEXT_PUBLIC_LOCALE` environment variable (set in `apphosting.yaml`):
- `en-US`: travelwithalefe.com
- `pt-BR`: viajarcomale.com.br

Translation strings in `src/app/utils/langs.js`. Use `useI18n()` hook for server components, `useI18nClient()` for client components.

### Data Flow
- **Firestore collections**: `/countries/{country}/cities/{city}/medias/{media}`, `/hashtags`, `/locations`
- **Cloud Storage**: Media files at `storage.googleapis.com/files.viajarcomale.com`
- **Image variants**: `/resize/500`, `/resize/8192`, `/resize/portrait`, `/resize/landscape`, `/resize/square`

### Firebase Cloud Functions (`functions/`)
- Firestore triggers: Auto-process media on create/update, create locations, update totals
- Scheduled functions: Auto-share content to X, Bluesky, Mastodon, Pixelfed
- Social sharing modules: `social-sharing.js`, `pixelfed-sharing.js`

### Helper Scripts (`helpers/`)
Browser-based HTML tools and Node.js scripts for processing Instagram archives into Firestore format. See `helpers/README.md` for the complete workflow to add new country data.

Key scripts:
- `story_archive_converter.js` - Convert Instagram archive HTML to JSON
- `story_create_json.js` - Generate folder structure and thumbnails
- `translate.js` - Translate descriptions to English
- HTML tools: `copy-data.html`, `copy-result.html`, `full-totals.html`, `previous-next.html`

### PWA & Caching
- Service worker via Serwist (`src/sw.js`)
- Cache configuration in `src/cache.js`
- Manifest generation at `/manifest.json/route.js`

## Key Files

- `src/app/utils/constants.js` - Site name, file domains, pagination settings
- `src/app/utils/countries.js` - Country metadata (name, slug, flag, cities, coordinates)
- `src/app/firebase.js` - Firebase Admin initialization
- `apphosting.yaml` - Firebase App Hosting config with environment variables
- `firestore.indexes.json` - Composite indexes for Firestore queries

## Edit Mode

For content editing in development, modify `src/app/utils/use-edit-mode.js` to return `editMode: true`. This enables inline editing of media metadata (hashtags, locations) directly in the browser.

## Active Technologies
- JavaScript/Node.js 20 (Cloud Functions), Next.js 16 with React 19 (Frontend) + Firebase Admin SDK 13.x, Firebase Functions 6.x, Serwist 9.x, firebase-admin/messaging (001-daily-push-notifications)
- Firestore (`pages/random` for content pool), FCM Topics (subscription management) (001-daily-push-notifications)

## Recent Changes
- 001-daily-push-notifications: Added JavaScript/Node.js 20 (Cloud Functions), Next.js 16 with React 19 (Frontend) + Firebase Admin SDK 13.x, Firebase Functions 6.x, Serwist 9.x, firebase-admin/messaging
