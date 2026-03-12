# Sziget Insider 2026 — Agent Handoff

Full context dump for a new agent picking up this codebase cold.
Last updated: commit `fec82ec` / `6fba5a6`.

---

## What this project is

Two standalone apps sharing one data file:

| Platform | Stack | Root |
|----------|-------|------|
| Web | Next.js 16, React 19, Tailwind CSS v4, Genkit AI | `/` (repo root) |
| Android | Jetpack Compose, Kotlin 2.0.21, Room, MVVM | `android/` |

Both read from `src/data/lineup.json` — 80 Sziget 2026 artists. The Android app bundles it as `android/app/src/main/assets/lineup.json`. When lineup data changes, edit the source and copy manually.

**Critical data constraint:** `stage`, `startTime`, `endTime` are `null` for all 80 artists. Sziget hasn't published schedule data. Do not build any UI that assumes these exist. `day` is populated for ~53% of artists. `vibes` is 100% populated.

---

## Repo structure (top level)

```
/
├── src/                        # Next.js web app
│   ├── app/                    # App Router pages + API routes
│   ├── components/             # React components
│   ├── data/                   # JSON data files (source of truth)
│   ├── ai/                     # Genkit AI flows
│   ├── hooks/                  # Client hooks (favorites, etc.)
│   ├── lib/                    # firebase.ts, spotify.ts
│   └── types/index.ts          # LineupItem, MapPin interfaces
├── public/
│   ├── sw.js                   # PWA service worker
│   └── manifest.json           # PWA manifest
├── android/                    # Android app (fully self-contained)
├── docs/                       # Architecture, features, UI guide
├── CLAUDE.md                   # Agent instructions (read this first)
├── FEATURES.md                 # ~165 feature backlog, S→D tier ranking
└── docs/FEATURES.md            # Honest build status (✅/⏳/❌)
```

---

## Web — current state

### Routes
| Route | Notes |
|-------|-------|
| `/` | Home — headliners, mood feed |
| `/discover` | Artist grid, all filters, Spotify matcher, playlist builder, AI Scout |
| `/artist/[id]` | Static. Spotify iframe embed ("Island Listen"), similar artists |
| `/map` | POI map — stages, food, water/toilets/first-aid |
| `/timetable` | Schedule grid — ⏳ no time data yet |
| `/passport` | Stamps + XP + link to /highlights |
| `/highlights` | Post-festival wrap — favorites, top genres/vibes, share |
| `/food` | Food vendor list with dietary filters |
| `/tools` | HUF converter, live weather, SOS beacon |
| `/packing-list` | Static packing guide |
| `/guide` | Festival guide subpages (camping, health, emergency, shuttle) |

### API routes
| Route | Method | Notes |
|-------|--------|-------|
| `/api/auth/spotify/login` | GET | Starts OAuth flow |
| `/api/auth/spotify/callback` | GET | Handles callback, sets httpOnly cookies |
| `/api/spotify/matches` | GET | Scans user's saved tracks vs lineup. Requires `spotify_access_token` cookie. |
| `/api/spotify/build-playlist` | POST | Body: `{artistIds: string[]}`. Gets top-3 tracks per artist, creates private playlist. Requires `playlist-modify-private` scope. |
| `/api/weather` | GET | Proxies Open-Meteo for Budapest. 30-min in-memory cache. Returns `{forecast: DailyForecast[], rainAlert: boolean}`. |

### Key files
- `src/lib/spotify.ts` — OAuth helpers. Scopes: `user-library-read playlist-modify-private playlist-modify-public`. If you change scopes, existing tokens will fail the new endpoint with 403 — the `PlaylistBuilder` component handles this with a re-login prompt.
- `src/components/SpotifyConnect.tsx` — Connects Spotify, calls `/api/spotify/matches`, triggers `onMatchesFound(ids)`
- `src/components/spotify/playlist-builder.tsx` — Build button, calls `/api/spotify/build-playlist`
- `src/components/tools/weather-widget.tsx` — Fetches `/api/weather`, renders 7-day strip + rain alert
- `src/hooks/use-favorites.ts` — localStorage-based favorites with conflict detection
- `src/app/highlights/page.tsx` — Reads favorites from `useFavorites`, computes genres/vibes, Web Share API

### Data persistence (web)
- **Favorites**: `localStorage` via `useFavorites` hook. No accounts, no backend.
- **Firebase** (`src/lib/firebase.ts`): configured but optional — can be used as alternative persistence layer.
- **Spotify tokens**: httpOnly cookies (`spotify_access_token`, `spotify_refresh_token`) set by callback route.

### PWA / offline
`public/sw.js` is already registered (via `PwaLoader` component in layout). Strategy:
- Navigation requests: network-first, cache fallback
- `/_next/static/` and images: cache-first
- `/api/weather`: stale-while-revalidate (cached for offline)
- All other `/api/` routes: network only (skip cache)

---

## Android — current state

### Architecture
MVVM, no Hilt. Manual `ViewModelProvider.Factory` everywhere. Room for user state only — artist/POI/food data is bundled JSON.

```
Package: com.example.szigerinsider2026
compileSdk: 35 | minSdk: 26 | Kotlin: 2.0.21
Room DB: version 2
```

### Navigation — all routes
| Route | Screen | Bottom bar? | Entry point |
|-------|--------|-------------|-------------|
| `splash` | SplashScreen | No | App launch |
| `home` | HomeScreen | Yes | Bottom nav |
| `discover` | DiscoverScreen | Yes | Bottom nav |
| `map` | MapScreen | Yes | Bottom nav |
| `passport` | PassportScreen | Yes | Bottom nav |
| `tools` | ToolsScreen | Yes | Bottom nav |
| `schedule` | ScheduleScreen | No | HomeScreen card |
| `artist/{artistId}` | ArtistDetailScreen | No | Discover / Home / similar artists |
| `vibe_quiz` | VibeQuizScreen | No | Discover |
| `vibe_results` | VibeResultScreen | No | After quiz |
| `guide` | SurvivalGuideScreen | No | Tools screen card |
| `food` | FoodScreen | No | Map → FOOD chip → "SEE ALL VENDORS →" |
| `highlights` | HighlightsScreen | No | Passport → "MY HIGHLIGHTS →" |

To add a new full-screen route: create file, import in `Navigation.kt`, add `composable()`, add route string to `showBottomBar` exclusion list.

### Room DB schema (version 2)
**`user_progress` table**
| Column | Type |
|--------|------|
| `id` | Int (always 1) |
| `legendXp` | Int |
| `currentRank` | String |
| `stampsCollected` | List\<String\> (JSON via Converters.kt) |
| `completedChallengeIds` | String (comma-separated) |
| `quizCompleted` | Boolean |

**`favorite_artists` table**
| Column | Type |
|--------|------|
| `artistId` | String (PK) |
| `timestamp` | Long |

`fallbackToDestructiveMigration()` is set — bump `@Database(version = N)` for any schema change. This wipes user data. Current version: **2**.

### Repositories
| Class | Source | Returns |
|-------|--------|---------|
| `LineupRepository` | `lineup.json` asset | `List<Artist>` |
| `POIRepository` | `poi.json` asset | `List<POI>` |
| `FoodRepository` | `food.json` asset | `List<FoodVendor>` |
| `WeatherRepository` | Open-Meteo network | `WeatherData` (30-min cache) |

All: coroutines + `Dispatchers.IO`, return empty list on failure.

### Screen inventory
- **HomeScreen** — Headliners feed (Wednesday artists flagged `isHeadliner`), countdown
- **DiscoverScreen** — `LazyVerticalGrid`, 4 filter rows (headliners/A-Z, day, genre, vibe), search, `DiscoverViewModel` + `ArtistViewModel`
- **ArtistDetailScreen** — Hero image, meta pills, genres, vibes, bio, social links, **Spotify WebView embed** (`AndroidView(WebView)` loading `open.spotify.com/embed/artist/{id}`), "More Like This" row
- **MapScreen** — Dot map with `BoxWithConstraints` coordinate scaling. Category chips: ALL/STAGES/FOOD/WATER. When FOOD active: shows "SEE ALL VENDORS →" chip that navigates to `food`. Hydration FAB pulses water pins. Accepts `navController: NavController? = null`.
- **FoodScreen** — `LazyColumn` with search + `FilterChip` rows. Category: ALL/Food/Drink. Dietary: VEGAN (tag `vegan`), GLUTEN-FREE (tag `gluten-free`), BUDGET HERO (`budgetOption != null`). `FoodViewModel` uses `combine()` on 4 flows.
- **PassportScreen** — Tabs: STAMPS / CHALLENGES. "MY HIGHLIGHTS →" button navigates to `highlights`. Accepts `navController: NavController? = null`.
- **HighlightsScreen** — Rank/XP/stamps stat boxes, top genres + vibes pill rows, favorite artist names, share via `Intent.ACTION_SEND`. `HighlightsViewModel` joins Room favorites with lineup JSON.
- **ToolsScreen** — `ToolsViewModel` loads weather. TACTICAL tab: `WeatherCard` (live, 5-day), `TentFinderCard` (GPS + compass), SOS beacon. SAFETY tab: emergency dial cards.
- **TentFinderCard** — Requests `ACCESS_FINE_LOCATION`. Uses `LocationManager.getLastKnownLocation`. Saves lat/lng in `SharedPreferences("sziget_tent")`. Shows bearing arrow (`Navigation` icon, rotated) + haversine distance when current + saved locations both known.
- **WeatherCard** — 5-day `LazyRow`, weather icon mapped from WMO code, animated rain alert banner.
- **SzigetWidget** (Glance) — Home screen widget showing rank, XP, favorites count. Reads Room via coroutine in `provideGlance`. Taps open `MainActivity`. `GlanceAppWidgetReceiver` registered in manifest.

### Key conventions
- **Every clickable element needs haptic**: `rememberHapticManager()` → `lightTap()` / `mediumTap()` / `favoriteTap()` / `successBurst()`
- **ViewModel factory pattern** (no Hilt):
  ```kotlin
  val vm: MyVm = viewModel(factory = object : ViewModelProvider.Factory {
      override fun <T : ViewModel> create(modelClass: Class<T>): T =
          MyVm(MyRepo(context)) as T
  })
  ```
  Or use a named inner `Factory` class (see `FoodViewModel`, `HighlightsViewModel`).
- **JSON deserialization**: Always `Json { ignoreUnknownKeys = true }.decodeFromString<T>(json)`
- **Colors** (never use raw hex in UI code, always use theme tokens):
  - `OLEDBlack` — all backgrounds
  - `CardBackground` — cards, chips, bottom nav
  - `AcidYellow` — primary CTA, active state, XP
  - `PrimaryMagenta` — favorites, passport
  - `ToxicGreen` — food, success, money
  - `CyanPulse` — water, hydration, weather
- **New screen checklist**: background `OLEDBlack`, headline uppercase+italic+Black, haptics on all interactions, content padding bottom `120.dp`, add to `showBottomBar` exclusion if full-screen

### Permissions declared in manifest
- `INTERNET`, `VIBRATE`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

### Gradle dependencies (non-obvious)
- `glance-appwidget:1.1.0` + `glance-material3:1.1.0` — for home screen widget
- `coil-compose` — all image loading via `AsyncImage`
- `kotlinx-serialization-json:1.6.3` — JSON asset parsing
- `kotlin-serialization` plugin applied in `build.gradle.kts`

---

## Data schema (shared)

### Artist (`lineup.json`)
```
id: string          // "1"–"80", stable
artist: string      // display name
countryCode: string // ISO 3166-1 alpha-2
day: string | null  // "Wednesday"–"Tuesday", ~53% populated
stage: null         // ALWAYS NULL — not published yet
startTime: null     // ALWAYS NULL
endTime: null       // ALWAYS NULL
genres: string[]    // 2–8 values
vibes: string[]     // 100% populated
imageUrl: string    // CDN URL
description: string // bio, 75/80 artists
isHeadliner: boolean
szigetUrl: string
socials: { spotify?, instagram?, youtube?, x?, tiktok?, facebook?, appleMusic?, soundcloud?, website? }
```

### FoodVendor (`food.json`)
```
id, name, category ("Food"|"Drink"), cuisine?, tags[], priceRange?,
location?, description?, budgetOption?, budgetPrice?, mapCoords?
```
Dietary tags in data: `"vegan"`, `"gluten-free"`, `"vegetarian"`. Budget detected via `budgetOption != null`.

### POI (`poi.json`)
8 entries. Types: `water`, `toilet`, `first-aid`, `camping`. Coords: `{x, y}` 0–100 normalized.

---

## What does NOT exist yet (most valuable next features)

From `FEATURES.md` — top remaining items:

1. **Clash detection** (#3) — logic is ready in `ScheduleScreen`, blocked on `startTime`/`endTime` data
2. **Push notifications** (#5) — WorkManager + FCM, needs time data
3. **Personal schedule builder** (#7) — time-slotted plan, different from favorites
4. **Offline map** (#51) — the SVG map uses fake coordinates; real georeferencing needs Sziget map data
5. **Spotify integration on Android** (#30) — web has full OAuth, Android only has WebView embed
6. **Multi-language** (#159) — English + Hungarian minimum
7. **Accessibility map** (#141) — wheelchair routes

Full ranked backlog is in `/FEATURES.md` in the repo root (~165 features, S→D tier).

---

## What is NOT in this codebase

- No backend server of any kind
- No real-time data
- No user accounts
- No GPS-based map positioning (map uses abstract 0–100 coordinates). `TentFinderCard` uses GPS but only for a saved marker, not map position.
- No push notifications yet
- No Spotify OAuth on Android (web only)
- No stage/schedule time data (Sziget hasn't published it)

---

## Commands

**Web** (from repo root):
```bash
npm run dev          # port 9002
npm run build
npm run typecheck    # pre-flight check before committing
npm run genkit:dev   # needed for AI flows locally
```

**Android** (from `android/`):
```bash
./gradlew assembleDebug
./gradlew test
```
Do not run Gradle during file-writing sessions — write files only, let the developer build.

---

## Active known issues

- Two pre-existing TypeScript errors (not introduced by recent work):
  - `.next/types/validator.ts` references missing `src/app/memories/page` — ignore
  - AI flow type mismatch in `recommend-artists-flow.ts` — ignore unless touching AI
- `npm run lint` has a shell issue in this environment (`next lint` receives "lint" as a directory arg) — use `npm run typecheck` instead to validate web changes

---

## Docs map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent instructions, commands, architecture summary — read first |
| `android/README.md` | Full Android file tree, routes, Room schema, patterns, design system |
| `docs/ARCHITECTURE.md` | Dual-platform architecture, data schema, API routes, what's NOT here |
| `docs/FEATURES.md` | Current build status table (✅/⏳/❌) per feature per platform |
| `docs/UI_GUIDE.md` | Color tokens, typography rules, haptic patterns, new-screen checklists |
| `docs/PHASE_3_PLAN.md` | Historical Phase 3 planning doc — mostly complete, useful for context |
| `FEATURES.md` | Full ~165 feature backlog ranked S→D tier |
| `docs/HANDOFF.md` | This file |
