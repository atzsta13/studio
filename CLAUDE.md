# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sziget Insider 2026 is a festival companion app with two parallel codebases:
- **Web** (Next.js 16 / React 19) — root of this repo
- **Android** (Jetpack Compose / Kotlin) — in the `android/` subdirectory

Both share the same lineup data: `src/data/lineup.json` is the single source of truth. The Android app bundles it as an asset at `android/app/src/main/assets/lineup.json`.

**Data availability note:** `stage`, `startTime`, and `endTime` are `null` for all 80 artists — Sziget has not published schedule data yet. Do not build UI that assumes these fields exist. Vibes are 100% populated (backfilled via `scripts/backfill-vibes.mjs`).

**Detailed docs:**
- `android/README.md` — Android architecture, patterns, full screen/route inventory
- `docs/ARCHITECTURE.md` — dual-platform architecture, data schema, what is NOT in this codebase
- `docs/FEATURES.md` — honest build status (✅ built / ⏳ awaiting data / ❌ not built)
- `docs/UI_GUIDE.md` — color tokens, typography rules, haptic patterns, checklist for new screens
- `docs/PHASE_3_PLAN.md` — Phase 3 historical roadmap (largely complete)

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

- **App Router**: Pages live in `src/app/`. Routes: `/`, `/discover`, `/artist/[id]`, `/map`, `/timetable`, `/passport`, `/food`, `/tools`, `/packing-list`, `/guide`, `/highlights`.
- **UI**: Tailwind CSS v4, Radix UI primitives, `lucide-react` icons, MUI components.
- **Data**: `src/data/lineup.json` is imported directly by server components and the AI flow. No database — all lineup data is static JSON.
- **Types**: Shared interfaces in `src/types/index.ts` — `LineupItem` and `MapPin`.
- **AI**: Genkit with `googleai/gemini-2.5-flash` (`src/ai/genkit.ts`). The artist recommendation flow is in `src/ai/flows/recommend-artists-flow.ts` — it takes a mood/preference prompt and returns up to 5 artist matches using the full lineup as context.
- **Firebase**: Configured in `src/lib/firebase.ts` (used for favorites persistence).
- **Spotify**: OAuth flow at `src/app/api/auth/spotify/`. Endpoints:
  - `/api/spotify/matches` — scans user's saved tracks against lineup
  - `/api/spotify/build-playlist` — POST, creates a Spotify playlist from matched artist IDs (top 3 tracks each)
  - Scopes: `user-library-read playlist-modify-private playlist-modify-public`
- **Weather**: `/api/weather` — proxies Open-Meteo (free, no API key) for Budapest. 30-min server-side cache. Returns 7-day forecast + `rainAlert` boolean.
- **Offline**: `public/sw.js` is the PWA service worker. Caches app shell (navigation network-first), static assets (cache-first), and `/api/weather` (stale-while-revalidate). Registered via `PwaLoader` component.

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

- **Navigation**: `ui/navigation/Navigation.kt` — bottom nav with 5 tabs + detail screens. Bottom nav is hidden on: `splash`, `artist/{id}`, `schedule`, `guide`, `vibe_quiz`, `vibe_results`, `highlights`, `food`.
- **Data layer**:
  - `data/model/` — Kotlin data classes (`Artist`, `POI`, `FoodVendor`, `MapCoords`, `WeatherData`, `DailyForecast`)
  - `data/repository/` — `LineupRepository` (lineup.json), `POIRepository` (poi.json), `FoodRepository` (food.json), `WeatherRepository` (Open-Meteo API, 30-min cache)
  - `data/local/` — Room database (`AppDatabase`, v2) with two entities: `UserProgress` (legendXp, currentRank, stampsCollected, completedChallengeIds, quizCompleted) and `FavoriteArtist`. Accessed via `UserDao`. Singleton via `AppDatabase.getDatabase(context)`.
- **Navigation**: Bottom nav is **scroll-aware** — hides when scrolling down, reappears on scroll up (Material Design 3). Filter header in Discover also collapses on scroll.
- **Screens**:
  - `ui/home/` — Island Pulse feed (Wednesday headliners from JSON)
  - `ui/discover/` — Artist grid with 4 filter rows (sort: headliners/A-Z, day, genre, vibe), collapsing header on scroll. "SURPRISE" button in sticky header triggers Serendipity modal. `DiscoverViewModel` + `ArtistViewModel` + `SpotifyViewModel`. `SerendipityScreen.kt` for random artist discovery.
  - `ui/artist/` — `ArtistDetailScreen` — hero image, meta pills, genres (clickable → filter Discover), vibes (clickable → filter Discover), bio, social links, Spotify embed ("Island Listen"), "Saw This Set" toggle, "More Like This" carousel. Genre/vibe tags navigate back to Discover with filter applied.
  - `ui/map/` — Tactical dot map with category filter (ALL/STAGES/FOOD/WATER). "SEE ALL VENDORS →" button appears when FOOD chip is active. `MapViewModel`.
  - `ui/food/` — `FoodScreen` + `FoodViewModel` — food vendor list with search, category chips (Food/Drink), dietary chips (VEGAN / GLUTEN-FREE / BUDGET HERO). Accessed from Map FOOD chip.
  - `ui/passport/` — Stamp collection + XP/rank + challenges, persisted in Room. "MY HIGHLIGHTS →" button. `PassportViewModel`.
  - `ui/highlights/` — `HighlightsScreen` + `HighlightsViewModel` — post-festival wrap: rank/XP/stamps stats, top genres/vibes, favorite artist list, share sheet.
  - `ui/tools/` — `ToolsScreen` (driven by `ToolsViewModel`): live weather card, tent finder with GPS, HUF converter, SOS beacon, emergency contacts. `WeatherCard.kt`, `TentFinderCard.kt`.
  - `ui/quiz/` — Vibe DNA quiz flow (`VibeQuizScreen` + `VibeResultScreen`)
  - `ui/splash/` — Brutalist entrance screen
  - `widget/` — `SzigetWidget` + `SzigetWidgetReceiver` — Glance home screen widget showing rank, XP, and favorite count.
- **Spotify (Android)**: PKCE OAuth flow in `data/repository/SpotifyRepository.kt`. Deep link: `sziget://spotify-callback`. Token stored in SharedPreferences. `SpotifyViewModel` manages auth state + matched artist IDs. Discover screen shows "N MATCHES" chip + "SHOW ONLY" toggle.
- **Bottom bar hidden on**: `splash`, `artist/{id}`, `schedule`, `guide`, `vibe_quiz`, `vibe_results`, `highlights`, `food`, `packing_list`.
- **Haptics**: `ui/utils/HapticManager.kt` — `lightTap()`, `mediumTap()`, `favoriteTap()`, `successBurst()`. Use `rememberHapticManager()` in any composable. Required on all interactive elements.
- **Theme**: Brutalist dark aesthetic. Colors in `ui/theme/Color.kt` — `OLEDBlack`, `AcidYellow`, `PrimaryMagenta`, `CardBackground`, `ToxicGreen`, `CyanPulse`.

### Key conventions

- `fallbackToDestructiveMigration()` is set on Room — schema changes wipe local data. Increment `version` in `@Database` annotation when changing entities. **Current version: 2.**
- The Kotlin serialization plugin (`kotlin-serialization`) is applied in `build.gradle.kts` — required for `@Serializable` to work at runtime. Always use `Json { ignoreUnknownKeys = true }` when deserializing.
- When adding a new screen: create the file, import it in `Navigation.kt`, add a `composable()` entry, add haptic feedback via `rememberHapticManager()`, add route to `showBottomBar` exclusion if it should hide the nav, add `onScrollStateChanged` callback if screen is scrollable.
- ViewModels use manual factory pattern (`ViewModelProvider.Factory`) — no Hilt.
- `Converters.kt` handles `List<String>` ↔ JSON for Room.
- Location permission (`ACCESS_FINE_LOCATION`) is declared in the manifest — needed by `TentFinderCard`.
- Glance widget dependencies: `glance-appwidget:1.1.0` + `glance-material3:1.1.0`.
- `DiscoverViewModel.pendingGenreFilter` / `pendingVibeFilter` — static fields for carrying filter state from ArtistDetailScreen back to Discover. Set before navigating, cleared in `init`.
