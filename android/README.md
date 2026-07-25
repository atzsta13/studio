# Open Festival Hub — Android

Jetpack Compose / Kotlin native app. Standalone — shares lineup data with the web app but has no runtime dependency on it.

**Key versions:** AGP 9.2.0 · Kotlin 2.3.20 · KSP 2.3.9 · Gradle 9.5 · Java 21 toolchain · compileSdk/targetSdk 36 · minSdk 26 · Compose BOM 2026.05 · Room 2.8.4 (DB v8) · Coil 3

> AGP 9.x note: the `kotlinOptions {}` DSL inside `android {}` is removed. This project uses the replacement — top-level `kotlin { compilerOptions { jvmTarget = JvmTarget.JVM_21 } }` in `app/build.gradle.kts`. `android/gradle/libs.versions.toml` is the single source of truth for versions.

---

## Architecture

**MVVM** with a manual Repository layer. No dependency injection framework (no Hilt, no Koin) — dependencies are constructed manually using `ViewModelProvider.Factory`.

```
UI (Composables)
    ↓ observes StateFlow
ViewModels (androidx.lifecycle.ViewModel)
    ↓ calls suspend funs
Repositories (coroutines, IO dispatcher)
    ↓ reads from
Assets (JSON) + Room DB (SQLite)
```

### Key architectural decisions

- **No Hilt** — ViewModels use the factory pattern. Always pass dependencies through the constructor, never use `LocalContext` inside a ViewModel.
- **ILineupRepository interface** — `DiscoverViewModel`, `VibeQuizViewModel`, and `LineupStatsViewModel` all take `ILineupRepository`, not the concrete class. Use `FakeLineupRepository` in tests (no Robolectric needed).
- **Offline-first** — all content is bundled. No network calls at runtime except artist images (Coil) and weather (Open-Meteo).
- **`fallbackToDestructiveMigration()`** is set on Room — always bump `@Database(version = N)` in `AppDatabase.kt` when changing entities.
- **SharedPreferences** for lightweight persistence: budget entries, notes, friend codes, tent location. Room is only for favorites.

---

## Navigation routes (20 total)

| Route | Screen | Bottom bar? |
|-------|--------|-------------|
| `splash` | SplashScreen | No |
| `festival_select` | FestivalSelectionScreen (first launch) | No |
| `festival_switch` | FestivalSelectionScreen (switch) | No |
| `home` | HomeScreen | Yes |
| `discover` | DiscoverScreen | Yes |
| `schedule` | ScheduleScreen (timetable grid) | Yes — gated by `features.timetable` |
| `map` | MapScreen | Yes |
| `tools` | ToolsScreen | Yes |
| `guide` | SurvivalGuideScreen | No |
| `artist/{id}` | ArtistDetailScreen | No |
| `vibe_quiz` | VibeQuizScreen | No |
| `vibe_results` | VibeResultScreen | No |
| `food` | FoodScreen | No |
| `packing_list` | PackingListScreen | No |
| `notes_journal` | NotesJournalScreen | No |
| `budget_tracker` | BudgetTrackerScreen | No |
| `genre_breakdown` | GenreBreakdownScreen | No |
| `vibe_radar` | VibeRadarScreen | No |
| `squad_link` | FriendFinderScreen | No |
| `speed_discovery` | SpeedDiscoveryScreen | No |

---

## Project structure

```
android/app/src/main/java/org/openfestivalhub/
│
├── data/
│   ├── config/
│   │   └── FestivalConfig.kt             # Config loader, festival selection prefs, switchFestival()
│   ├── local/
│   │   ├── AppDatabase.kt                # Room DB singleton, version 8
│   │   ├── Converters.kt                 # List<String> ↔ JSON for Room
│   │   ├── FavoriteArtist.kt             # Entity: artistId, timestamp, tier
│   │   └── UserDao.kt                    # All Room queries (favorites)
│   ├── model/
│   │   ├── Artist.kt                     # @Serializable — mirrors lineup.json schema
│   │   ├── DailyForecast.kt              # Weather forecast day
│   │   ├── FoodVendor.kt                 # @Serializable — mirrors food.json schema
│   │   ├── MapCoords.kt                  # {x: Int, y: Int} normalized 0–100
│   │   ├── POI.kt                        # @Serializable — mirrors poi.json schema
│   │   └── WeatherData.kt                # WeatherData(daily, rainAlert)
│   └── repository/
│       ├── ILineupRepository.kt          # Interface — always use this in ViewModels
│       ├── LineupRepository.kt           # Implements ILineupRepository, loads lineup.json
│       ├── FoodRepository.kt             # Loads food.json from assets
│       ├── POIRepository.kt              # Loads poi.json from assets
│       └── WeatherRepository.kt          # Open-Meteo API fetch, 30-min in-memory cache
│
├── ui/
│   ├── artist/
│   │   └── ArtistDetailScreen.kt         # Hero, socials, Spotify WebView, "more like this"
│   ├── components/
│   │   └── ArtistCard.kt                 # Reusable card — Discover + Quiz results
│   ├── discover/
│   │   ├── ArtistViewModel.kt            # Manages favorites via Room UserDao
│   │   ├── CountryExplorerSheet.kt       # Bottom sheet: artists grouped by country
│   │   ├── DiscoverScreen.kt             # Filters, search, speed discovery entry, AI Scout
│   │   ├── DiscoverViewModel.kt          # Filter/search state (uses ILineupRepository)
│   │   ├── GenreBreakdownScreen.kt       # Animated bar chart — top 12 genres; tap → filter
│   │   ├── LineupStatsViewModel.kt       # genreStats + vibeStats StateFlows
│   │   ├── SerendipityScreen.kt          # Full-screen random artist modal
│   │   ├── SpeedDiscoveryScreen.kt       # Swipe-card discovery
│   │   └── VibeRadarScreen.kt            # Canvas spider chart — 8 vibe dimensions
│   ├── food/
│   │   ├── FoodScreen.kt                 # Vendor list with search + dietary filters
│   │   └── FoodViewModel.kt
│   ├── home/
│   │   ├── HomeScreen.kt                 # Countdown, headliners, quick nav, mood feed
│   │   └── LineupDiffSheet.kt            # 2025 vs 2026 comparison sheet
│   ├── map/
│   │   ├── MapScreen.kt                  # Tactical dot map — stages, water, first-aid
│   │   └── MapViewModel.kt
│   ├── navigation/
│   │   └── Navigation.kt                 # NavHost + bottom bar — all 18 routes here
│   ├── quiz/
│   │   ├── VibeQuizScreen.kt             # 5-step mood quiz
│   │   ├── VibeQuizViewModel.kt          # Scoring algorithm (uses ILineupRepository)
│   │   └── VibeResultScreen.kt           # Results + bulk-favorite FAB
│   ├── schedule/
│   │   ├── ScheduleScreen.kt             # Timetable grid — GRID / BY-TIME / MY-LINEUP tabs, live states, clash banner
│   │   └── ScheduleViewModel.kt
│   ├── splash/
│   │   ├── SplashScreen.kt               # Entrance → home or festival_select
│   │   └── FestivalSelectionScreen.kt    # First-launch + switch festival picker
│   ├── theme/
│   │   ├── Color.kt                      # OLEDBlack, AcidYellow, PrimaryMagenta, CyanPulse, ToxicGreen
│   │   ├── Theme.kt
│   │   └── Type.kt                       # BrutalistTypography
│   ├── tools/
│   │   ├── BudgetTrackerScreen.kt        # Arc ring, quick-add chips, entry log
│   │   ├── BudgetTrackerViewModel.kt     # BudgetEntry @Serializable, SharedPreferences
│   │   ├── FriendFinderScreen.kt         # ZXing QR squad code, manual entry (NO camera)
│   │   ├── NotesJournalScreen.kt         # FAB compose, category chips, long-press delete
│   │   ├── NotesJournalViewModel.kt      # NoteEntry @Serializable, SharedPreferences
│   │   ├── SurvivalGuideScreen.kt        # Collapsible guide sections
│   │   ├── TentFinderCard.kt             # GPS tent marker, compass bearing
│   │   ├── ToolsScreen.kt                # All cards — gated by config.features flags
│   │   ├── ToolsViewModel.kt             # Loads weather via WeatherRepository
│   │   └── WeatherCard.kt                # 5-day forecast + rain alert banner
│   └── utils/
│       └── HapticManager.kt              # lightTap / mediumTap / favoriteTap / successBurst
│
├── widget/
│   ├── SzigetWidget.kt                   # Glance Widget — countdown + saved artist count
│   └── SzigetWidgetReceiver.kt           # GlanceAppWidgetReceiver
│
└── MainActivity.kt
```

### Assets (White-Label)

Single APK — all festival data is bundled per festival under `android/app/src/main/assets/<festival-id>/`
- `config.json` — feature flags, theme colors, festival metadata
- `lineup.json` — all artists
- `poi.json` — map POIs (stages, water, first-aid)
- `food.json` — food vendors
- `survival.json` — guide content + pricing

---

## Room Database

**Version: 8** — `AppDatabase.kt`

### `FavoriteArtist` (table: `favorite_artists`)
| Column | Type | Notes |
|--------|------|-------|
| `artistId` | String | Primary key, matches `Artist.id` |
| `timestamp` | Long | System.currentTimeMillis() |
| `tier` | String | `"must_see"` or `"interested"` |

---

## Design system

### Colors (`ui/theme/Color.kt`)
```kotlin
OLEDBlack       // #000000 — all screen backgrounds
CardBackground  // ~#111111 — card surfaces, bottom nav
AcidYellow      // #FFED4E — primary accent (genre bars, quiz highlights)
PrimaryMagenta  // #FF0080 — favorites, Vibe Quiz accent
ToxicGreen      // #4ADE80 — success, money, Survival Guide
CyanPulse       // #00C3FF — hydration, medical, water UI
TextPrimary     // White
TextMuted       // ~65% white — secondary info
```

### Typography (`BrutalistTypography` in `ui/theme/Type.kt`)
- Headlines: `Black`, `Italic`, negative letter spacing
- Labels: uppercase, wide letter spacing
- Body: regular weight, 22sp line height

---

## Build commands

From `android/` directory:
```bash
./gradlew assembleDebug            # Build the single "Open Festival Hub" APK
./gradlew test                     # Unit tests (no device needed)
./gradlew installDebug             # Build + install to connected device/ADB
# APK: app/build/outputs/apk/debug/app-debug.apk
```
