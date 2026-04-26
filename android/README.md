# Sziget Insider 2026 — Android

Jetpack Compose / Kotlin native app. Standalone — shares lineup data with the web app but has no runtime dependency on it.

**Key versions:** AGP 8.13.2 · Kotlin 2.0.21 · compileSdk 35 · minSdk 26 · Compose BOM latest · Room 2.x

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
- **Offline-first** — all content is bundled. No network calls at runtime except for artist images (loaded via Coil from `imageUrl`).
- **`fallbackToDestructiveMigration()`** is set on Room — incrementing the DB version wipes local data. Always bump `@Database(version = N)` in `AppDatabase.kt` when changing entities.

---

## Project structure

```
android/app/src/main/java/com/example/szigerinsider2026/
│
├── data/
│   ├── config/
│   │   └── FestivalConfig.kt           # Currency rates, festival constants
│   ├── local/
│   │   ├── AppDatabase.kt              # Room DB singleton, version 8
│   │   ├── Converters.kt               # List<String> ↔ JSON for Room
│   │   ├── FavoriteArtist.kt           # Entity: artistId, timestamp, tier
│   │   ├── UserDao.kt                  # All Room queries (favorites)
│   ├── model/
│   │   ├── Artist.kt                   # @Serializable — mirrors lineup.json schema
│   │   ├── DailyForecast.kt            # Weather forecast day (part of WeatherData)
│   │   ├── FoodVendor.kt               # @Serializable — mirrors food.json schema
│   │   ├── MapCoords.kt                # {x: Int, y: Int} normalized 0–100
│   │   ├── POI.kt                      # @Serializable — mirrors poi.json schema
│   │   └── WeatherData.kt              # WeatherData(daily, rainAlert) + DailyForecast
│   └── repository/
│       ├── FoodRepository.kt           # Loads food.json from assets
│       ├── LineupRepository.kt         # Loads lineup.json (or lineup_2025.json)
│       ├── POIRepository.kt            # Loads poi.json from assets
│       └── WeatherRepository.kt        # Open-Meteo API fetch, 30-min in-memory cache
│
├── ui/
│   ├── artist/
│   │   └── ArtistDetailScreen.kt       # Hero, socials, Spotify WebView embed, "more like this"
│   ├── components/
│   │   └── ArtistCard.kt               # Reusable card used in Discover + Quiz results
│   ├── discover/
│   │   ├── ArtistViewModel.kt          # Manages favorites via Room UserDao
│   │   ├── DiscoverScreen.kt           # Compact TopAppBar, 2-row consolidated filters
│   │   ├── DiscoverViewModel.kt        # Filter state, search, country filter
│   │   └── CountryExplorerSheet.kt     # Bottom sheet: artists grouped by country
│   ├── food/
│   │   ├── FoodScreen.kt               # Vendor list: search, category + dietary FilterChips
│   │   └── FoodViewModel.kt            # Combines allVendors + searchQuery + category + tags flows
│   ├── home/
│   │   ├── HomeScreen.kt               # Countdown, headliners, quick nav, mood feed
│   │   └── LineupDiffSheet.kt          # 2025 vs 2026 comparison sheet
│   ├── map/
│   │   ├── MapScreen.kt                # Tactical dot map; "SEE ALL VENDORS →" when FOOD active
│   │   └── MapViewModel.kt             # POI/food loading, category filter
│   ├── navigation/
│   │   └── Navigation.kt               # NavHost + bottom bar, all routes defined here
│   ├── quiz/
│   │   ├── VibeQuizScreen.kt           # 5-step mood quiz
│   │   ├── VibeQuizViewModel.kt        # Quiz state + artist scoring algorithm
│   │   └── VibeResultScreen.kt         # Matched artist reveal + bulk-favorite
│   ├── schedule/
│   │   └── ScheduleScreen.kt           # GRID 2.0: 2D Drag, Pinch-to-Zoom, SQUAD LINK
│   ├── splash/
│   │   └── SplashScreen.kt             # Brutalist entrance, 2s delay → home
│   ├── theme/
│   │   ├── Color.kt                    # All color tokens
│   │   ├── Theme.kt
│   │   └── Type.kt                     # BrutalistTypography
│   ├── tools/
│   │   ├── SurvivalGuideScreen.kt      # Collapsible guide sections
│   │   ├── TentFinderCard.kt           # GPS tent marker, SharedPreferences, compass bearing
│   │   ├── ToolsScreen.kt              # HUF converter, WeatherCard, TentFinderCard, SOS, emergency
│   │   ├── ToolsViewModel.kt           # Loads weather via WeatherRepository
│   │   └── WeatherCard.kt              # 5-day forecast strip + animated rain alert banner
│   ├── utils/
│   │   └── HapticManager.kt            # lightTap / mediumTap / favoriteTap / successBurst
│
├── widget/
│   └── SzigetWidget.kt                # Glance Widget UI
│   └── SzigetWidgetReceiver.kt         # GlanceAppWidgetReceiver
│
└── MainActivity.kt
```

### Assets (White-Label)

Each flavor has its own `assets` directory:
`android/app/src/[flavor]/assets/`
- `config.json`
- `lineup.json`
- `poi.json`
- `food.json`
- `survival.json`

---

## Room Database

**Version: 8** — `AppDatabase.kt`

### `FavoriteArtist` (table: `favorite_artists`)
| Column | Type | Notes |
|--------|------|-------|
| `artistId` | String | Primary key, matches `Artist.id` |
| `timestamp` | Long | System.currentTimeMillis() |
| `tier` | String | "must_see" or "interested" |

---

## Design system (Android)

### Colors (`ui/theme/Color.kt`)
```kotlin
OLEDBlack       // #000000 — all screen backgrounds
CardBackground  // ~#111111 — card surfaces, bottom nav
PrimaryMagenta  // #FF0080 — favorites, Vibe Quiz accent
ToxicGreen      // #4ADE80 — success, money, Survival Guide accent
CyanPulse       // #00C3FF — hydration, medical, water UI
TextPrimary     // White
TextMuted       // ~65% white — labels, secondary info
```

### Typography (`BrutalistTypography` in `ui/theme/Type.kt`)
- Headlines: `Black`, `Italic`, negative spacing
- Labels: uppercase, wide spacing
- Body: regular, 22sp line height

---

## Build commands

From `android/` directory:
```bash
./gradlew assembleSzigetDebug      # Build Sziget variant
./gradlew assembleDebug            # Build ALL variants
./gradlew test                     # Unit tests
```
