# Open Festival Hub — Android

Jetpack Compose / Kotlin native app. Standalone — shares lineup data with the web app but has no runtime dependency on it.

**Key versions:** AGP 9.2.1 · Kotlin 2.3.20 · KSP 2.3.9 · Gradle 9.5.1 · Java 21 toolchain · compileSdk/targetSdk 36 · minSdk 26 · Compose BOM 2026.06.01 · Room 2.8.4 (DB v8) · Coil 3

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

Package root: `android/app/src/main/java/org/openfestivalhub/`

| Package | What lives there |
|---|---|
| `data/config/` | `FestivalConfig.kt` — config loader, festival-selection prefs, `switchFestival()` |
| `data/local/` | Room: `AppDatabase` (v8), `UserDao`/`ArtistDao`, `FavoriteArtist`/`ArtistEntity`, `Converters` |
| `data/model/` | `@Serializable` mirrors of the JSON schemas — `Artist`, `POI`, `FoodVendor`, `GuideModels`, `WeatherData`, `MapCoords` |
| `data/repository/` | One repo per data source, each behind an `I*Repository` interface so tests use fakes (no Robolectric). `BaseJsonRepository` handles asset loading; `LocalScoutRepository` wraps the on-device LLM |
| `ui/artist/` | `ArtistDetailScreen` — hero, social links, Spotify embed island, "more like this" |
| `ui/components/` | Shared UI — `ArtistCard`, `DesignSystem`, `OfflineBanner` |
| `ui/discover/` | Lineup browsing: filters/search, speed discovery, serendipity, genre breakdown, vibe radar, tag cloud, AI Scout entry |
| `ui/schedule/` | `ScheduleScreen` — GRID / BY-TIME / MY-LINEUP tabs, live states, clash banner |
| `ui/home/` `ui/map/` `ui/food/` `ui/quiz/` `ui/packing/` `ui/splash/` | One screen area each, `*Screen.kt` + optional `*ViewModel.kt` |
| `ui/tools/` | Every tool card, each gated by a `config.features` flag — budget, notes, tent/car finder, squad QR, weather, countdown, survival guide |
| `ui/navigation/` | `Navigation.kt` — NavHost + bottom bar, all 20 routes |
| `ui/theme/` | `Color.kt`, `Theme.kt`, `Type.kt` (BrutalistTypography) |
| `ui/utils/` | `HapticManager`, `FestivalUtils` (shared `parseTime`/`formatTime`), `QRUtils`, `TranslationManager`, `MoodHelper`, `SeenArtistsHelper` |
| `widget/` | Glance widget — `FestivalWidget` + `FestivalWidgetReceiver` |

> Don't mirror the full file list here — it rots. `find android/app/src/main/java -name '*.kt'` is the source of truth.

### Assets (White-Label)

Single APK — all festival data is bundled per festival under `android/app/src/main/assets/<festival-id>/`
- `config.json` — feature flags, theme colors, festival metadata
- `lineup.json` — all artists
- `lineup_2025.json` — previous year, for the lineup-diff sheet (absent for some festivals)
- `poi.json` — map POIs (stages, water, first-aid)
- `food.json` — food vendors
- `guide.json` / `survival.json` — guide content + pricing
- `store_meta.json` — listing copy

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
