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
- **Room for user state only** — artist/POI/food data comes from bundled JSON assets, never written to Room. Room stores only `UserProgress` (XP, rank, stamps, challenges) and `FavoriteArtist` records.
- **Offline-first** — all content is bundled. No network calls at runtime except for artist images (loaded via Coil from `imageUrl`).
- **`fallbackToDestructiveMigration()`** is set on Room — incrementing the DB version wipes local data. Always bump `@Database(version = N)` in `AppDatabase.kt` when changing entities.

---

## Project structure

```
android/app/src/main/java/com/example/szigerinsider2026/
│
├── data/
│   ├── content/
│   │   └── SurvivalGuideContent.kt     # Hardcoded guide sections (no network)
│   ├── local/
│   │   ├── AppDatabase.kt              # Room DB singleton, version 2
│   │   ├── Converters.kt               # List<String> ↔ JSON for Room
│   │   ├── FavoriteArtist.kt           # Entity: artistId, timestamp, mustSee, priority
│   │   ├── UserDao.kt                  # All Room queries
│   │   └── UserProgress.kt             # Entity: XP, rank, stamps, completedChallengeIds
│   ├── model/
│   │   ├── Artist.kt                   # @Serializable — mirrors lineup.json schema
│   │   ├── FoodVendor.kt               # @Serializable — mirrors food.json schema
│   │   ├── MapCoords.kt                # {x: Int, y: Int} normalized 0–100
│   │   └── POI.kt                      # @Serializable — mirrors poi.json schema
│   └── repository/
│       ├── FoodRepository.kt           # Loads food.json from assets
│       ├── LineupRepository.kt         # Loads lineup.json (or lineup_2025.json)
│       └── POIRepository.kt            # Loads poi.json from assets
│
├── ui/
│   ├── artist/
│   │   └── ArtistDetailScreen.kt       # Full hero screen, socials, "more like this"
│   ├── components/
│   │   └── ArtistCard.kt               # Reusable card used in Discover + Quiz results
│   ├── discover/
│   │   ├── ArtistViewModel.kt          # Manages favorites via Room UserDao
│   │   ├── DiscoverScreen.kt           # Artist grid, 4 filter rows, collapsing header
│   │   ├── DiscoverViewModel.kt        # Filter state, search, country filter
│   │   └── CountryExplorerSheet.kt     # Bottom sheet: artists grouped by country
│   ├── home/
│   │   ├── HomeScreen.kt               # Countdown, headliners, quick nav, mood feed
│   │   └── LineupDiffSheet.kt          # 2025 vs 2026 comparison sheet
│   ├── map/
│   │   ├── MapScreen.kt                # Tactical dot map with BoxWithConstraints scaling
│   │   └── MapViewModel.kt             # POI/food loading, category filter
│   ├── navigation/
│   │   └── Navigation.kt               # NavHost + bottom bar, all routes defined here
│   ├── passport/
│   │   ├── ChallengeEngine.kt          # Pure function: favorites + artists → List<Challenge>
│   │   ├── ChallengeListScreen.kt      # Embeddable challenge card list
│   │   ├── PassportScreen.kt           # Tabs: STAMPS / CHALLENGES
│   │   └── PassportViewModel.kt        # Loads progress, evaluates challenges, awards XP
│   ├── quiz/
│   │   ├── VibeQuizScreen.kt           # 5-step mood quiz
│   │   ├── VibeQuizViewModel.kt        # Quiz state + artist scoring algorithm
│   │   └── VibeResultScreen.kt         # Matched artist reveal + bulk-favorite
│   ├── schedule/
│   │   └── ScheduleScreen.kt           # Day-tab artist list (clash detection ready, no times yet)
│   ├── splash/
│   │   └── SplashScreen.kt             # Brutalist entrance, 2s delay → home
│   ├── theme/
│   │   ├── Color.kt                    # All color tokens (see UI Guide below)
│   │   ├── Theme.kt
│   │   └── Type.kt                     # BrutalistTypography
│   ├── tools/
│   │   ├── SurvivalGuideScreen.kt      # Collapsible guide sections, phrase clipboard copy
│   │   └── ToolsScreen.kt              # HUF converter, SOS beacon, emergency contacts
│   └── utils/
│       └── HapticManager.kt            # lightTap / mediumTap / favoriteTap / successBurst
│
└── MainActivity.kt
```

### Assets

```
android/app/src/main/assets/
├── lineup.json          # 80 artists — synced from src/data/lineup.json
├── lineup_2025.json     # 82 artists — previous year, used for lineup diff feature
├── poi.json             # 8 POIs (water, toilet, first-aid, camping)
└── food.json            # 10 food vendors (placeholder — real data pending)
```

---

## Navigation

All routes are defined in `ui/navigation/Navigation.kt`.

| Route | Screen | Bottom bar? |
|-------|--------|-------------|
| `splash` | `SplashScreen` | No |
| `home` | `HomeScreen` | Yes |
| `discover` | `DiscoverScreen` | Yes |
| `map` | `MapScreen` | Yes |
| `passport` | `PassportScreen` | Yes |
| `tools` | `ToolsScreen` | Yes |
| `schedule` | `ScheduleScreen` | No |
| `artist/{artistId}` | `ArtistDetailScreen` | No |
| `vibe_quiz` | `VibeQuizScreen` | No |
| `vibe_results` | `VibeResultScreen` | No |
| `guide` | `SurvivalGuideScreen` | No |

Bottom bar is hidden when `currentRoute` is `splash`, starts with `artist/`, or is in the explicit exclusion list in `showBottomBar`.

---

## Room Database

**Version: 2** — `AppDatabase.kt`

Entities:

### `UserProgress` (table: `user_progress`)
| Column | Type | Notes |
|--------|------|-------|
| `id` | Int | Always 1 (singleton row) |
| `totalXP` | Int | Accumulated XP |
| `currentRank` | String | e.g. `"ISLAND SCOUT"` |
| `unlockedStamps` | String | JSON array of stamp IDs |
| `completedChallengeIds` | String | Comma-separated challenge IDs |
| `quizCompleted` | Boolean | True after first Vibe Quiz completion |

### `FavoriteArtist` (table: `favorite_artists`)
| Column | Type | Notes |
|--------|------|-------|
| `artistId` | String | Primary key, matches `Artist.id` |
| `timestamp` | Long | System.currentTimeMillis() |

**Important:** `fallbackToDestructiveMigration()` is set. Adding or changing columns requires incrementing the version number — this wipes all user data in development builds.

---

## Key patterns

### ViewModel factory (no Hilt)
```kotlin
val vm: MyViewModel = viewModel(
    factory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return MyViewModel(MyRepository(context)) as T
        }
    }
)
```
Or use a named inner `Factory` class:
```kotlin
class MyViewModel(private val repo: MyRepository) : ViewModel() {
    class Factory(private val repo: MyRepository) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return MyViewModel(repo) as T
        }
    }
}
```

### Haptics — use on every interactive element
```kotlin
val haptic = rememberHapticManager()

// In onClick:
haptic.lightTap()       // chip, nav item, minor toggle
haptic.mediumTap()      // card tap, filter change, confirm
haptic.favoriteTap()    // starring/favoriting an artist
haptic.successBurst()   // completing a challenge, saving all results
```

### Loading JSON assets
```kotlin
// In a Repository:
suspend fun getArtists(fileName: String = "lineup.json"): List<Artist> =
    withContext(Dispatchers.IO) {
        try {
            val json = context.assets.open(fileName).bufferedReader().readText()
            Json { ignoreUnknownKeys = true }.decodeFromString(json)
        } catch (e: Exception) {
            emptyList()
        }
    }
```

### Adding a new screen
1. Create `ui/yourfeature/YourScreen.kt` — package `com.example.szigerinsider2026.ui.yourfeature`
2. Add `import` in `Navigation.kt`
3. Add `composable("your_route") { YourScreen(navController) }` in the `NavHost`
4. If bottom bar should be hidden: add `"your_route"` to the `showBottomBar` exclusion expression
5. Add `haptic = rememberHapticManager()` inside the composable and wire it to all interactive elements
6. Follow the brutalist style (see UI Guide below)

### Kotlinx Serialization
The `kotlin-serialization` plugin is applied in `build.gradle.kts`. Data classes that map to JSON must be annotated `@Serializable`. Always use `Json { ignoreUnknownKeys = true }` when deserializing to stay forward-compatible.

---

## Design system (Android)

### Colors (`ui/theme/Color.kt`)
```kotlin
OLEDBlack       // #000000 — all screen backgrounds
CardBackground  // ~#111111 — card surfaces, bottom nav
AcidYellow      // #FFEE00 — primary CTA, active state, XP text
PrimaryMagenta  // #FF0080 — favorites, Vibe Quiz accent
ToxicGreen      // #4ADE80 — success, money, Survival Guide accent
CyanPulse       // #00C3FF — hydration, medical, water UI
TextPrimary     // White
TextMuted       // ~65% white — labels, secondary info
MutedBackground // ~15% white — subtle dividers
```

### Typography (`BrutalistTypography` in `ui/theme/Type.kt`)
- Headlines: `fontWeight = FontWeight.Black`, `fontStyle = FontStyle.Italic`, `letterSpacing` negative
- Labels/overlines: uppercase, `letterSpacing` wide (2–4sp)
- Body: regular weight, `lineHeight = 22.sp`

### Rules
- Background is always `OLEDBlack`
- All interactive elements must have haptic feedback
- Card shape: `RoundedCornerShape(16.dp)` to `RoundedCornerShape(20.dp)`
- Active/selected state: `AcidYellow` background (chips) or border
- No shadows — use subtle borders (`Color.White.copy(alpha = 0.06f)`) for depth

---

## Build commands

From `android/` directory:
```bash
./gradlew assembleDebug            # Debug APK
./gradlew assembleRelease          # Release APK (requires signing config)
./gradlew test                     # Unit tests
./gradlew connectedAndroidTest     # Instrumented tests (device/emulator required)
./gradlew lint                     # Lint
```

Do **not** run Gradle during agent-assisted development sessions — write files only.
