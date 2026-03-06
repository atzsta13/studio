# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sziget Insider 2026 is a festival companion app with two parallel codebases:
- **Web** (Next.js 16 / React 19) — root of this repo
- **Android** (Jetpack Compose / Kotlin) — in the `android/` subdirectory

Both share the same lineup data: `src/data/lineup.json` is the single source of truth. The Android app bundles it as an asset at `android/app/src/main/assets/lineup.json`.

---

## Web (Next.js)

### Commands

```bash
npm run dev          # Dev server on port 9002
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)

# Genkit AI dev server (needed for AI flows in development)
npm run genkit:dev

# Lineup data pipeline
npm run lineup:update   # Full pipeline: scrape -> clean -> vibes -> show
npm run lineup:scrape   # Fetch artists from Sziget website (puppeteer)
npm run lineup:clean    # Dedup, fix encoding, extract days, add country codes
npm run lineup:vibes    # Generate vibe tags from genres
npm run lineup:show     # Print summary
```

### Architecture

- **App Router**: Pages live in `src/app/`. Routes: `/`, `/discover`, `/artist/[id]`, `/map`, `/timetable`, `/passport`, `/food`, `/tools`, `/packing-list`, `/guide`.
- **UI**: Tailwind CSS v4, Radix UI primitives, `lucide-react` icons, MUI components.
- **Data**: `src/data/lineup.json` is imported directly by server components and the AI flow. No database — all lineup data is static JSON.
- **Types**: Shared interfaces in `src/types/index.ts` — `LineupItem` and `MapPin`.
- **AI**: Genkit with `googleai/gemini-2.5-flash` (`src/ai/genkit.ts`). The artist recommendation flow is in `src/ai/flows/recommend-artists-flow.ts` — it takes a mood/preference prompt and returns up to 5 artist matches using the full lineup as context.
- **Firebase**: Configured in `src/lib/firebase.ts` (used for favorites persistence).
- **Spotify**: OAuth flow at `src/app/api/auth/spotify/` with a matching endpoint at `/api/spotify/matches`.

---

## Android (Jetpack Compose)

### Commands

Build and run via Android Studio, or from `android/`:

```bash
./gradlew assembleDebug          # Build debug APK
./gradlew test                   # Unit tests
./gradlew connectedAndroidTest   # Instrumented tests (requires device/emulator)
```

Key versions: AGP 8.13.2, Kotlin 2.0.21, compileSdk 35, minSdk 26.

### Architecture

**MVVM** with a Repository layer. No Hilt/DI — dependencies are manually constructed.

- **Navigation**: `ui/navigation/Navigation.kt` — bottom nav with 5 tabs: Home, Discover (Artists), Map, Passport, Tools. App starts on a `SplashScreen` then routes to `HomeScreen`.
- **Data layer**:
  - `data/model/` — Kotlin data classes (`Artist`, `POI`, `FoodVendor`, `MapCoords`)
  - `data/repository/` — `LineupRepository` reads bundled JSON assets; `POIRepository` and `FoodRepository` for map/food data
  - `data/local/` — Room database (`AppDatabase`, v1) with two entities: `UserProgress` (XP, rank, stamps) and `FavoriteArtist`. Accessed via `UserDao`. Database is a singleton obtained via `AppDatabase.getDatabase(context)`.
- **ViewModels**: Located alongside their screens in `ui/<screen>/`. Currently: `ArtistViewModel`, `DiscoverViewModel`, `MapViewModel`, `PassportViewModel`.
- **Theme**: Brutalist dark aesthetic. Colors defined in `ui/theme/Color.kt` — `OLEDBlack`, `AcidYellow`, `PrimaryMagenta`, `CardBackground`, `ToxicGreen`, `CyanPulse`.

### Key conventions

- `fallbackToDestructiveMigration()` is set on the Room database — schema changes will wipe local data.
- When adding a new screen, import it in `Navigation.kt` and add a `composable()` entry in `NavHost`.
- The `Converters.kt` type converter handles `List<String>` serialization for Room.
