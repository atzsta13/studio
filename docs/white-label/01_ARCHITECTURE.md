# White-Label Architecture

This document describes the full technical architecture for converting Sziget Insider from a single-festival app into a configurable multi-festival platform on both web (Next.js) and Android (Jetpack Compose).

---

## Current State: The Problem

The app was purpose-built for Sziget. As of the Phase 0 audit, **93+ Sziget-specific literals** are scattered across both codebases:

```
src/components/home/festival-countdown.tsx  → hardcoded Aug 5-11 2026 dates
src/app/api/weather/route.ts               → hardcoded lat=47.5194, lng=19.0512
src/app/page.tsx                           → hardcoded a.day === 'Wednesday'
src/lib/challenges.ts                      → hardcoded 7-day week list
src/ai/flows/recommend-artists-flow.ts     → hardcoded "Sziget Insider Scout" persona
src/components/layout/header.tsx           → hardcoded "Sziget Insider" text
public/manifest.json                       → hardcoded app name, theme color #222051
android/.../data/config/FestivalConfig.kt  → ✅ ALREADY CENTRALIZED (good pattern)
android/.../ui/home/HomeScreen.kt          → reads from FestivalConfig (good)
android/.../ui/discover/DiscoverViewModel  → hardcoded dayOrder list
android/.../data/content/SurvivalGuide.kt  → hardcoded Hungarian phrases, Keleti shuttle
android/app/src/main/AndroidManifest.xml   → hardcoded "sziget" deep link scheme
android/app/src/main/res/values/strings.xml→ hardcoded app_name
```

The Android side has a `FestivalConfig.kt` object that already centralizes constants — the developer left a comment: *"When adapting for a different festival, only this file needs to change."* The web side has no equivalent.

---

## Target Architecture

### Principle: Config-First

Every festival-specific value lives in exactly one place per platform:

- **Web**: `src/config/festival.ts` — a `FestivalConfig` TypeScript object selected at build time via `NEXT_PUBLIC_FESTIVAL_ID`
- **Android**: `android/app/src/main/java/.../data/config/FestivalConfig.kt` — a Kotlin object that switches on `BuildConfig.FESTIVAL_ID` (set per product flavor)

No component, screen, hook, or API route may hard-code a festival name, coordinate, date, currency symbol, or AI persona string. All such values are read from the config.

### Data Flow (Web)

```
NEXT_PUBLIC_FESTIVAL_ID=area53-2026  (env var, set in Vercel project)
        │
        ▼
src/config/festival.ts
  loadFestivalConfig()
  → returns FESTIVAL_CONFIGS['area53-2026']
        │
        ├──► src/app/layout.tsx           (metadata: title, description, theme-color)
        │    └── injects CSS vars         (--primary, --accent, --secondary, --background)
        │
        ├──► src/app/api/weather/route.ts (lat, lng, timezone)
        │
        ├──► src/components/home/         (startDate, endDate, name, city, openingDayFilter)
        │    festival-countdown.tsx
        │
        ├──► src/lib/challenges.ts        (dates.days list)
        │
        ├──► src/ai/flows/               (aiPersona, name, year, fullName)
        │    recommend-artists-flow.ts
        │
        ├──► src/components/tools/       (location.weatherDisplayName)
        │    weather-widget.tsx
        │
        ├──► src/components/tools/       (features.currencyConverter, currency.*)
        │    currency-converter.tsx
        │
        └──► public/manifest.json        (generated at build time by scripts/generate-manifest.mjs)
```

### Data Flow (Android)

```
BuildConfig.FESTIVAL_ID = "area53-2026"  (set by productFlavor in build.gradle.kts)
        │
        ▼
FestivalConfig.kt
  val current: FestivalConfigData
  → lazy { when(BuildConfig.FESTIVAL_ID) { "area53-2026" -> area53Config ... } }
        │
        ├──► ui/theme/Theme.kt           (primaryColor, accentColor, secondaryColor)
        │
        ├──► ui/home/HomeScreen.kt       (openingDayFilter, startDay, startMonth)
        │
        ├──► ui/discover/DiscoverViewModel (days list)
        │
        ├──► ui/tools/ToolsScreen.kt     (features.currencyConverter, lat, lng)
        │
        ├──► ui/map/MapViewModel.kt      (loaded from flavor-specific poi.json asset)
        │
        ├──► data/repository/WeatherRepository.kt (lat, lng, timezone)
        │
        └──► MainActivity.kt            (deepLinkScheme)
```

### Festival Data Packages

Each festival owns a directory under `festivals/`:

```
festivals/
├── sziget-2026/
│   ├── data/
│   │   ├── lineup.json       ← ~80 artists with vibes, genres, days
│   │   ├── poi.json          ← map pins (stages, toilets, medical, water, ATMs)
│   │   ├── food.json         ← food vendor list
│   │   └── guide.json        ← survival guide sections + tips
│   └── assets/
│       ├── map.svg           ← venue map (SVG, percentage-based coordinates)
│       ├── icon-192.png
│       ├── icon-512.png
│       └── og-image.png      ← 1200×630 Open Graph image
├── area53-2026/
│   └── ... (same structure)
├── novarock-2026/
│   └── ...
└── frequency-2026/
    └── ...
```

The web build copies the correct festival's `data/` directory to `src/data/` at build time (via `scripts/sync-data.mjs`). The Android build uses per-flavor source sets (`android/app/src/<flavor>/assets/`) so Gradle automatically bundles the right files.

---

## Key Architectural Decisions

### 1. Static JSON over CMS

**Decision**: Keep lineup, POI, food, and guide data as static JSON files. Do not introduce a headless CMS or database.

**Rationale**:
- The app is offline-first. Static JSON is bundled in the APK / served as a static asset and cached by the service worker. A CMS requires network access.
- Festival lineups are updated a handful of times per year (announce → confirm → schedule). The scrape → clean → vibes pipeline already handles incremental updates.
- Adding a CMS layer would require an admin UI, authentication, real-time sync logic, and infra cost — all for data that changes ~5 times/year.

**Exception**: If an organizer needs self-serve lineup updates without a code push, a lightweight admin panel writing to a Firebase collection is viable as a Phase 5 enhancement. The data schema is already Firebase-friendly.

### 2. One Vercel Deployment Per Festival

**Decision**: Each festival is a separate Vercel project (`festival-insider-sziget`, `festival-insider-area53`, etc.) pointing at the same repository, with a different `FESTIVAL_ID` env var.

**Rationale**:
- Complete isolation: one festival's deploy cannot break another's.
- Custom domains per festival: `sziget.insiderapp.com`, `area53.insiderapp.com`.
- Independent deploy cadence: push a lineup update to Area 53 without triggering a Sziget redeploy.
- Simpler than subdomain routing middleware, which would require loading all festival configs on every request.

### 3. Android Product Flavors (Not Runtime Config)

**Decision**: Use Gradle product flavors to produce a separate APK per festival, each with its own `applicationId`, app name, and icon.

**Rationale**:
- Each festival needs its own Google Play listing (separate icon, screenshots, store description).
- Different `applicationId` = separate app on the user's device. A user attending both Sziget and Area 53 installs both; favorites/passport data stays isolated.
- Deep link scheme per festival (`sziget2026://`, `area532026://`) prevents Spotify OAuth callback collisions if both apps are installed.

### 4. Feature Flags as Config (No Feature Flag Library)

**Decision**: Feature flags live in `FestivalConfig.features` as plain booleans. No LaunchDarkly, Flagsmith, or similar service.

**Rationale**:
- Flags are build-time constants, not runtime toggles. They change only when the festival config changes (i.e., between deploys). Runtime toggle infrastructure adds complexity without value here.
- Zero external dependencies. Flags are tree-shakeable at build time if used with `if (FESTIVAL.features.xxx)` checks.
- The full flag set is visible in one config object, making it easy to audit what's enabled for a given festival.

---

## Component Responsibility Boundaries

| Layer | Owns | Does NOT own |
|---|---|---|
| `FestivalConfig` | All festival-specific constants | Any UI logic, data fetching, or formatting |
| `lineup.json` | Artist data for one festival-year | Config values (dates, coords, currency) |
| Page/Screen components | Layout, state, data fetching | Hardcoded festival strings |
| AI flow | Prompt template, response parsing | Festival persona (comes from config) |
| Weather API route | HTTP call, caching | Coordinates (come from config) |
| Android `WeatherRepository` | HTTP call, 30-min cache | Coordinates (come from config) |
| Product flavor assets | Festival-specific JSON + icons | Shared business logic |

---

## Migration Path

```
Current (monolith)          Phase 1                  Phase 2+
──────────────────────      ──────────────────────   ──────────────────────
All Sziget literals   ──►   FestivalConfig (web)  ──► Area 53 config added
scattered in code           FestivalConfig (Android)  Area 53 data package
                            Zero hardcoded strings    Area 53 deployed
                            Sziget still the only     New festivals = config
                            deployed festival         + data only
```

Phase 1 produces a codebase where deploying a new festival requires:
1. Create `festivals/<slug>/data/*.json`
2. Add one entry to `FESTIVAL_CONFIGS` in `src/config/festival.ts`
3. Add one `FestivalConfigData` instance to `FestivalConfig.kt`
4. Add one product flavor to `build.gradle.kts`
5. Create a Vercel project with `FESTIVAL_ID=<slug>`

No changes to any shared component, API route, screen, or business logic file.

---

## What Is Already Festival-Agnostic (No Changes Needed)

These systems are clean and require zero modification:

- **Spotify OAuth flow** — PKCE, fully generic
- **Firebase favorites persistence** — config-driven project ID
- **Open-Meteo weather client** — just swap coordinates (done via config)
- **Genkit AI infrastructure** — just update the prompt string (done via config)
- **Service worker / PWA caching** — cache-first, network-first strategies are generic
- **Room database schema** — `FavoriteArtist` and `UserProgress` entities have no festival fields
- **Discover filter system** — genre/vibe/day filters are data-driven from `lineup.json`
- **Passport XP mechanic** — point values, rank thresholds, challenge structure are all generic
- **Serendipity (random artist)** — pure lineup sampling, no festival logic
- **Vibe quiz** — question set and result logic are genre-agnostic (vibe taxonomy is config)
- **Artist card / artist detail UI** — displays whatever data is in `lineup.json`
