# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **Festival Insider Platform** is a multi-festival engine with two parallel codebases:
- **Web** (Next.js 16 / React 19) — root directory.
- **Android** (Jetpack Compose / Kotlin) — `android/` directory.

### **White-Label Mandate (CRITICAL)**
This is a **Config-First** platform. **NEVER** hardcode brand names (Sziget, Nova Rock), dates, colors, or coordinates in components or logic.
- **Web**: Always import `FESTIVAL` from `@/config/festival`.
- **Android**: Always use `FestivalConfig` constants.
- **Data**: All festival-specific data lives in `festivals/<festival-id>/data/`. The build process (`npm run prebuild`) syncs this to `src/data/`.

## Common Commands

### Web (Next.js)
```bash
# Development (defaults to Sziget; predev auto-runs sync-data.mjs)
npm run dev

# Build/Dev for specific festival
NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run dev
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run build

# Quality Control (typecheck must pass before any merge)
npm run typecheck
npm run lint

# Tests (Vitest + React Testing Library)
npm test              # watch mode
npm test -- --run     # CI / single pass
npm test -- ArtistCard.test.tsx   # single file
npm test -- --coverage

# AI flows (Genkit + Gemini 2.5 Flash)
npm run genkit:dev    # starts Genkit dev UI
```

### Android
```bash
# Build specific flavor
./gradlew assembleSzigetDebug
./gradlew assembleArea53Debug
./gradlew assembleNovarockDebug
./gradlew assembleFrequencyDebug

# Tests
./gradlew test                          # unit tests (no device needed)
./gradlew connectedAndroidTest          # instrumented tests (device/emulator)
./gradlew test --tests "DiscoverViewModelTest"
```

### Data Pipeline
```bash
# Sync active festival data to src/data/ (runs automatically on dev/build)
npm run lineup:sync

# Full lineup update for a specific festival (scrape → clean → vibes → sync)
npm run lineup:update:sziget
npm run lineup:update:novarock
npm run lineup:update:area53
npm run lineup:update:frequency

# Push synced data to Android assets
npm run android:sync:sziget
```

## Architecture Patterns

### 1. Web Configuration
- **Interface**: `FestivalConfig` in `src/config/festival.ts`.
- **Injection**: `FESTIVAL` object is exported based on `process.env.NEXT_PUBLIC_FESTIVAL_ID`.
- **Theming**: `src/app/layout.tsx` injects CSS variables (`--primary`, `--accent`, etc.) from the config.

### 2. Android Configuration
- **Product Flavors**: Defined in `android/app/build.gradle.kts`.
- **Flavor Config**: `FestivalConfig.kt` switches logic based on `BuildConfig.FESTIVAL_ID`.
- **Themes**: `FestivalInsiderTheme` in `Theme.kt` pulls colors dynamically.

### 3. Data Flow
- **Source of truth**: `festivals/<id>/data/*.json` (one directory per festival ID).
- **Sync**: `scripts/sync-data.mjs` → `src/data/` (Web); `scripts/sync-android-assets.mjs` → Android assets.
- **Format**: Static JSON only. `stage`/`startTime`/`endTime` are always `null` — do not build UI that assumes they exist.

### 4. Storage & Persistence
- **Web**: `localStorage` keys **must** be prefixed with `${FESTIVAL.id}` to avoid cross-festival data pollution.
- **Android**: Room v2 with `fallbackToDestructiveMigration()`. Increment `@Database(version = …)` for every entity change. Two entities: `UserProgress` (singleton id=1) and `FavoriteArtist`.

### 5. Web UI Stack
- **Atomic components**: ShadCN (Radix) in `src/components/ui/`.
- **Complex layouts**: MUI 6. MUI theme is synced to Tailwind CSS variables via `MuiRegistry` component — do not set MUI colors directly.
- **Hydration safety**: Use `isMounted` pattern or `suppressHydrationWarning` for browser-only values (GPS, flags).

### 6. AI (Genkit)
- Flow at `src/ai/flows/recommend-artists-flow.ts`: accepts a free-text mood string, injects full `lineup.json` as context, returns up to 5 artist IDs.
- Requires `GOOGLE_GENAI_API_KEY`. Does **not** call external music APIs.

## Coding Standards
- **TypeScript**: Strict mode. No `any`. Use interfaces from `src/types/index.ts`.
- **Offline-First**: All features (except Spotify matching) must work without an internet connection.
- **Brutalist UI**: Follow the high-contrast, bold aesthetic defined in `docs/UI_GUIDE.md`.
- **Haptics**: Required on all interactive elements in Android via `rememberHapticManager()`.
- **Icons**: Lucide (Web). Import individually to avoid HMR module factory errors. Android uses Vector Drawables.
- **Android ViewModel**: Manual `ViewModelProvider.Factory` pattern — no Hilt DI.
