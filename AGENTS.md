# AGENTS.md

Agent instructions for the Festival Insider Platform. Applies to Claude Code, Cursor, Gemini, and any other AI tool working in this repo.

## Project Overview

The **Festival Insider Platform** is a multi-festival, offline-first companion app with two parallel codebases:
- **Web** (Next.js 16 / React 19) — root directory. Exported as a **fully static site** (`output: 'export'`), deployed to GitHub Pages at `https://atzsta13.github.io/studio/`.
- **Android** (Jetpack Compose / Kotlin) — `android/` directory.

**No backend. No API routes. No server required.** Everything runs client-side from static JSON.

### White-Label Mandate (CRITICAL)
This is a **Config-First** platform. **NEVER** hardcode brand names, dates, colors, or coordinates in components or logic.
- **Web**: Always import `FESTIVAL` from `@/config/festival-engine`.
- **Android**: Always use `FestivalConfig` constants.
- **Data**: All festival-specific data lives in `festivals/<festival-id>/data/`. The build process syncs this to `public/data/` and the Android assets.

## Festivals

| ID | Name | Artists | Schedule | Status (as of Jul 2026) |
|----|------|---------|----------|--------|
| `sziget-2026` | Sziget | 458 | **Full timetable** 442/458 | Upcoming — Aug 9–16. **Flagship priority.** |
| `novarock-2026` | Nova Rock | 84 | **Full timetable** 84/84 | Past (Jun 11–14) |
| `frequency-2026` | Frequency | ~95 | TBA (null) | Upcoming — Aug, schedule not published |
| `area53-2026` | Area 53 | 30 | **Full timetable** | **Imminent — Jul 15–18** |
| `ernte-punk-2026` | Ernte Punk | ~17 | TBA (null) | Upcoming, schedule not published |
| `rock-am-ring-2026` | Rock am Ring | 73 | **Full timetable** | Past (Jun 5–7) |

All `startTime`/`endTime` values are **ISO 8601 with offset** (e.g. `"2026-07-16T22:30:00+02:00"`) — never plain `"HH:mm"`. Festivals marked TBA have `null` times. `features.timetable` is `false` for festivals without schedule data.

Known bugs and the prioritized backlog live in **`TASKS.md`** — check it before starting work; your task may already be specified there.

## Common Commands

### Web (Next.js)
```bash
# Development
npm run dev

# Quality Control (must pass before any commit)
npm run typecheck
npm run lint

# Tests (Vitest + React Testing Library) — 189 passing
npm test -- --run

# Static export build (outputs to out/)
npm run build
```

### Data Pipeline
```bash
# Full lineup update: scrape → clean → vibes → sync → android assets
npm run lineup:update:sziget
npm run lineup:update:novarock
npm run lineup:update:area53
npm run lineup:update:frequency
npm run lineup:update:ernte-punk
npm run lineup:update:rock-am-ring   # sync only — timetable data is hand-authored from PDF

# Sync existing data to public/data/ and android assets (no scrape)
npm run lineup:sync
```

### Android
```bash
./gradlew assembleDebug   # single "Festival Insider" APK
./gradlew test            # unit tests (no device needed)
```

### Deployment
Push to `main` → GitHub Actions builds static export → deploys to GitHub Pages automatically.
Workflow: `.github/workflows/deploy-pages.yml`

## Architecture

### Web — Key Patterns

**Static Export**: `next.config.ts` has `output: 'export'`, `basePath: '/studio'`, `trailingSlash: true`.

**basePath is critical**: All client-side `fetch()` calls for JSON data MUST use the `BASE_PATH` helper:
```ts
import { BASE_PATH } from '@/lib/base-path';
fetch(`${BASE_PATH}/data/${festivalId}/lineup.json`);
```
Without this, fetches will 404 on GitHub Pages. `BASE_PATH` is `'/studio'` in production, `''` locally.

**Dynamic routing**: Pages live in `src/app/[festivalId]/`. The `[festivalId]/layout.tsx` exports `generateStaticParams()` for all festivals. The `[festivalId]/artist/[id]/layout.tsx` pre-renders all artist pages.

**Data loading**: `useInsider()` hook (from `InsiderProvider`) loads lineup + config client-side from `public/data/<festivalId>/lineup.json`. All user state (favorites, progress) is `localStorage`-only, prefixed with `${FESTIVAL.id}`.

**Config**: `FestivalConfig` interface in `src/config/festival-engine.ts`. Each festival has a `config.json` in `festivals/<id>/`. No `spotifyIntegration` field — Spotify OAuth was removed.

**Weather**: `WeatherWidget` fetches Open-Meteo directly (free public API, no auth). No proxy needed.

**Images**: All artist images are hotlinked to their original CDN — never downloaded or hosted. `ArtistImage` component (`src/components/ui/artist-image.tsx`) wraps every `<img>` with a `© source.com` attribution watermark.

**UI Stack**: ShadCN (Radix) for atomic components, MUI 6 for complex layouts. MUI theme synced to Tailwind via `MuiRegistry`. Never set MUI colors directly.

**Hydration**: Use `isMounted` pattern or `suppressHydrationWarning` for browser-only values.

### Android — Key Patterns
- **Single APK**: `applicationId = "com.example.festivalinsider"`, all festival assets bundled under `src/main/assets/<festival-id>/`
- **Config**: `FestivalConfig.kt` — reads `assets/<festival-id>/config.json` for the selected festival
- **DB**: Room v2, `fallbackToDestructiveMigration()`, increment `@Database(version=…)` for every entity change
- **Nav**: Manual `ViewModelProvider.Factory` — no Hilt
- **Artist images**: Hotlinked to CDN with `SpotifyIsland`-style attribution (social links only, no OAuth)
- **Haptics**: Required on all interactive elements via `rememberHapticManager()`

### Data Flow
```
festivals/<id>/data/*.json
  → scripts/sync-data.mjs
  → public/data/<id>/          (served statically, fetched at runtime)
  → android/app/src/main/assets/<id>/ (bundled into APK)
```

## What Was Removed (Do Not Re-Add)

- **Spotify OAuth** — Spotify revoked API access for new apps. The `spotifyIntegration` feature flag is gone from all configs. Do not add OAuth flows, `/api/auth/spotify/`, match endpoints, or playlist builders.
- **Firebase** — Project migrated away from Firebase Studio. No Firebase dependency, no `firebase.ts`.
- **API routes** — There are zero Next.js API routes. The app is fully static. Do not add `route.ts` files.
- **Rate limiting / middleware** — No server, so no middleware. `src/proxy.ts` is deleted.
- **Server-side AI** — No Genkit, no Gemini API calls from the web app. Android uses on-device Gemma only.

## Hard Constraints

- **NO ACCOUNTS** — no login, no email, no phone numbers. 100% anonymous.
- **NO SOCIAL** — no feeds, no photo walls, no moderation liability.
- **NO CAMERA** — no AR, no QR scanning. Ever.
- **NO DATA COLLECTION** — all user data stays 100% local.
- **NO API ROUTES** — static export only. Any `route.ts` breaks the build.
- **OFFLINE FIRST** — Map, Guide, Lineup, and all core features must work with zero signal.
- **CONFIG FIRST** — no hardcoded festival names, colors, coordinates, or dates in any component.
- **IMAGES** — never download or host artist images. Always hotlink to source CDN. Always use `ArtistImage` component for attribution.

## Coding Standards
- **TypeScript**: Strict mode. No `any`. Interfaces in `src/types/index.ts`.
- **Icons**: Lucide (Web), import individually. Android uses Vector Drawables.
- **No comments** unless the WHY is non-obvious.
- **Tests**: 189 passing — keep green. Run `npm test -- --run` before committing.

## Docs Map (keep it this lean)

| File | Purpose |
|---|---|
| `AGENTS.md` | **This file** — rules, commands, architecture summary. Canonical agent entry point. |
| `README.md` | Human-facing project overview |
| `TASKS.md` | Open/unfinished work — the only backlog file |
| `docs/STATUS.md` | Live state snapshot (data coverage, open issues, recently shipped) |
| `docs/architecture/ARCHITECTURE.md` | Deep technical reference |
| `docs/GOALS.md` | The why behind every feature |
| `docs/features/FEATURES.md` | Feature matrix per platform |
| `docs/TIMETABLE.md` | Full brief of the timetable feature |
| `docs/guides/MANDATES.md` | Hard constraints |
| `docs/guides/UI_GUIDE.md` | Design system |
| `docs/guides/TROUBLESHOOTING.md` | Dev troubleshooting |
| `android/README.md` | Android architecture + routes |

Do **not** create new status/snapshot docs (`CURRENT.md`, `UPDATED.md`, `LLM_BRIEF.md` etc. were deleted for rotting). Update `docs/STATUS.md` and `TASKS.md` instead.

### Vendor entry files (do not fork content into them)

`AGENTS.md` is the single source of truth for every AI tool. The per-vendor files are thin pointers only:

| File | Tool | Mechanism |
|---|---|---|
| `CLAUDE.md` | Claude Code | `@AGENTS.md` import |
| `GEMINI.md` | Gemini CLI | `@AGENTS.md` import |
| `.github/copilot-instructions.md` | GitHub Copilot | Plain-text pointer (Copilot does not expand `@` imports) |
| — | Cursor, Codex, and other AGENTS.md-native tools | Read `AGENTS.md` directly |

Never add rules to a vendor file — add them here.
