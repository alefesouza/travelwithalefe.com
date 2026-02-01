<!--
  SYNC IMPACT REPORT
  ==================
  Version change: N/A → 1.0.0 (initial constitution)

  Added principles:
  - I. Code Quality
  - II. Testing Standards
  - III. User Experience Consistency
  - IV. Performance Requirements

  Added sections:
  - Technical Standards (Section 2)
  - Development Workflow (Section 3)
  - Governance

  Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No changes needed (Constitution Check already exists)
  - .specify/templates/spec-template.md: ✅ No changes needed (Requirements section aligns)
  - .specify/templates/tasks-template.md: ✅ No changes needed (Test phases optional, performance tasks in Polish phase)

  Follow-up TODOs: None
-->

# Travel with Alefe Constitution

## Core Principles

### I. Code Quality

All code MUST be maintainable, readable, and follow established patterns.

- **Consistency**: Follow existing codebase conventions (naming, file structure, component patterns)
- **Simplicity**: Prefer simple, direct solutions over clever or over-engineered approaches
- **DRY with judgment**: Extract shared logic only when used 3+ times; avoid premature abstraction
- **Self-documenting code**: Use descriptive names; comments explain "why", not "what"
- **No dead code**: Remove unused imports, variables, and functions immediately
- **Linting compliance**: All code MUST pass ESLint checks before commit

**Rationale**: Consistent, simple code reduces cognitive load and makes the codebase accessible to
future maintainers. The travel content site must remain easy to update as new destinations are added.

### II. Testing Standards

Testing is OPTIONAL unless explicitly requested, but when tests exist they MUST be reliable.

- **Test when appropriate**: Add tests for critical paths (data processing, API routes) when requested
- **No flaky tests**: Tests MUST pass consistently; remove or fix flaky tests immediately
- **Test realistic scenarios**: Use realistic data matching Firestore document structure
- **Manual verification**: For UI changes, verify in browser with Firebase emulators before committing
- **Build validation**: `npm run build` MUST succeed before any PR

**Rationale**: This project prioritizes shipping content updates quickly. Heavy test requirements
would slow down the content pipeline. Build validation catches most breaking changes.

### III. User Experience Consistency

The user experience MUST be consistent across all pages and both locales.

- **Bilingual parity**: Features available on travelwithalefe.com MUST work on viajarcomale.com.br
- **Visual consistency**: Use existing component patterns (cards, grids, navigation) for new features
- **Mobile-first**: All features MUST work on mobile devices; test at 375px width minimum
- **Progressive enhancement**: Core content MUST be accessible without JavaScript (SSR)
- **Accessibility basics**: Images MUST have alt text; interactive elements MUST be keyboard-accessible
- **Loading states**: Show skeleton loaders or spinners during data fetches; never show blank screens

**Rationale**: Users browse travel content on various devices. A consistent, accessible experience
builds trust and keeps visitors engaged across the site.

### IV. Performance Requirements

The site MUST load quickly and remain responsive.

- **Core Web Vitals**: Target LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Image optimization**: Use appropriate resize variants (`/resize/500`, `/resize/portrait`, etc.)
- **Lazy loading**: Images below the fold MUST use lazy loading
- **Bundle size**: Avoid adding large dependencies; prefer lightweight alternatives
- **Caching**: Leverage service worker caching (Serwist) for repeat visits
- **Database queries**: Use indexed queries; avoid full collection scans

**Rationale**: Travel sites compete for attention. Slow load times cause visitors to leave before
seeing content. Performance directly impacts SEO and user satisfaction.

## Technical Standards

### Technology Stack

- **Framework**: Next.js with App Router (server components by default)
- **Database**: Firebase Firestore with Admin SDK
- **Storage**: Google Cloud Storage for media files
- **Deployment**: Firebase App Hosting
- **PWA**: Serwist service worker for offline capability

### File Organization

- Routes follow `/countries/[country]/cities/[city]/` pattern
- Shared utilities in `src/app/utils/`
- Translation strings in `src/app/utils/langs.js`
- Helper scripts for content processing in `helpers/`

### Environment Configuration

- Locale determined by `NEXT_PUBLIC_LOCALE` environment variable
- Firebase config managed through `apphosting.yaml`
- Never commit secrets or API keys

## Development Workflow

### Before Starting Work

1. Run `npm run dev` to verify local environment works
2. Check git status for uncommitted changes
3. Read relevant existing code before making modifications

### During Development

1. Make incremental changes; commit logical units of work
2. Test changes locally with Firebase emulators when touching data
3. Run `npm run lint` to catch issues early
4. Verify changes work in both English and Portuguese locales

### Before Committing

1. `npm run lint` MUST pass
2. `npm run build` MUST succeed
3. Manual browser testing for UI changes
4. Clear, descriptive commit messages

## Governance

This constitution establishes non-negotiable standards for the Travel with Alefe project.

**Amendment Process**:
1. Propose changes with rationale
2. Document impact on existing code
3. Update version using semantic versioning:
   - MAJOR: Removing principles or fundamental changes
   - MINOR: Adding new principles or significant guidance
   - PATCH: Clarifications and minor wording changes
4. Update LAST_AMENDED_DATE

**Compliance**:
- All pull requests MUST comply with these principles
- Violations require explicit justification in PR description
- Constitution takes precedence over conflicting practices

**Version**: 1.0.0 | **Ratified**: 2026-01-31 | **Last Amended**: 2026-01-31
