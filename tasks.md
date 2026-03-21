# 🗂️ Sziget Insider 2026: Comprehensive Migration & State Manifest
**Target Platform:** Native Android (Jetpack Compose)
**Date:** 2026-03-06
**Status:** Phase 3 (Social & Tactical)

---

## 🕰️ Project Evolution & Context
Sziget Insider 2026 has undergone a major architectural evolution to reach its current native state:

1.  **Stage 1: The Firebase Era**: Originally conceived as a web application utilizing **Firebase Studio** for real-time cloud data and authentication.
2.  **Stage 2: The Local Web implementation**: Transitioned to a **Next.js** App Router architecture. During this phase, the project pivoted to a **Local-First** model, moving away from cloud dependencies to ensure the app functions perfectly in high-density, low-connectivity festival environments.
3.  **Stage 3: The Native Android Port (Current)**: The project is now being fully ported to **Native Android (Kotlin + Jetpack Compose)**. This move provides deeper hardware integration (Flashlight/SOS) and superior performance while strictly maintaining the "Offline-First" philosophy established in the web reference.

---

## 🏛️ System Architecture Overview

### 1. UI Framework: Neon Brutalism (Jetpack Compose)
The UI is built on a custom design system mapped from the original Next.js web application.
- **Theme**: `ui.theme.Theme.kt` forces a persistent dark mode (OLED Black).
- **Core Colors**: `AcidYellow`, `PrimaryMagenta`, `ToxicGreen`, `CyanPulse` (Atomic OLED palette).
- **Typography**: Heavily stylized `BrutalistTypography` using extra-bold weights and italicized headers.
- **Navigation**: `ui.navigation.Navigation.kt` manages a 5-tab scaffold + a SplashScreen.
  - *Home* (Strategic Radar)
  - *Discover* (Music Finder)
  - *Map* (Tactical POI)
  - *Passport* (Legend XP / Gamification)
  - *Tools* (Survival Toolkit)

### 2. Data Strategy: Offline-First & Reactive
The app operates strictly without internet access, fulfilling the "Survival Toolkit" requirement.
- **Local Assets**: JSON files (`lineup.json`, `poi.json`, `food.json`) are parsed from `assets/` using `kotlinx.serialization`.
- **Persistence (Room Database)**:
  - `AppDatabase.kt`: The central database instance.
  - `UserDao.kt`: Handles CRUD for user progress and favorites.
  - `UserProgress.kt`: Stores XP, current Rank, and a list of collected Stamps.
  - `FavoriteArtist.kt`: Stores favorited artist IDs.
- **Repositories**: Singleton repositories (`LineupRepository`, `POIRepository`) manage the abstraction between local JSON and the UI.
- **ViewModels**: Every major screen now has a corresponding `ViewModel` (e.g., `DiscoverViewModel`, `PassportViewModel`) providing reactive `StateFlow` streams.

---

## 🏗️ Detailed Component Status

| Module | Location | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Main Activity** | `MainActivity.kt` | ✅ Done | Roots the AppNavigation. |
| **Splash Screen** | `ui.splash.SplashScreen` | ✅ Done | Brutalist entrance with 2s delay transition. |
| **Home Screen** | `ui.home.HomeScreen` | ✅ Done | Includes "Island Pulse" (Now Playing) logic. |
| **Discover Grid** | `ui.discover.DiscoverScreen` | ✅ Done | High-density TopAppBar + consolidated filters. |
| **Tactical Map** | `ui.map.MapScreen` | 🚧 Partial | UI is high-fidelity; POI filtering logic is wired but needs verification. |
| **Passport** | `ui.passport.PassportScreen` | ✅ Done | XP/Rank logic linked to Room via `PassportViewModel`. |
| **Schedule Screen** | `ui.schedule.ScheduleScreen` | ✅ Done | Grid 2.0: 2D Scroll, Zoom, Pinned Headers. |
| **Squad Link** | `ui.utils.QRUtils` | ✅ Done | Peer-to-Peer QR sharing & Scanning via ML Kit. |
| **Database** | `data.local.*` | ✅ Done | Entities, DAOs, and TypeConverters complete. |

---

## 🛠️ Build & Dependency Configuration
The project uses **Version Catalogs** (`libs.versions.toml`). Key dependencies recently added/updated:
- **Navigation**: `androidx.navigation:navigation-compose:2.8.0`
- **Room**: `androidx.room:room-runtime:2.6.1` (with KSP compiler)
- **Serialization**: `kotlinx-serialization-json:1.6.3`
- **Image Loading**: `io.coil-kt:coil-compose:2.6.0`
- **Camera & Scanning**: `androidx.camera:*`, `com.google.mlkit:barcode-scanning`, `com.google.zxing:core`
- **Lifecycle**: `androidx.lifecycle:lifecycle-runtime-compose:2.8.4`
- **Extended Icons**: `androidx.compose.material:material-icons-extended:1.6.8`

---

## 🚦 Critical Hand-off Instructions for Next Agent

### 1. The Build Verification (The "Grand Sync")
The sub-agents have finished writing the logic, but the **entire app needs a clean compilation**.
- **Run**: `cd android && ./gradlew app:assembleDebug`
- **Expectation**: There might be minor import conflicts in `Navigation.kt` or `ToolsScreen.kt` regarding Extended Material Icons. Fix these immediately by explicitly importing the icons in the file header rather than using wildcards (`*`).

### 2. Logic Verification Tasks
- **Verify**: Does clicking a "Stamp" in `PassportScreen` write to the Room DB?
- **Verify**: Does the `DiscoverScreen` correctly filter by vibe?
- **Verify**: Does the `ArtistCard` favoriting state persist after minimizing/reopening?

### 3. Constraints
- **NO NETWORK**: Never add Retrofit or Ktor.
- **NO TAILWIND**: This is a native Android project. Use standard Compose `Modifier` and the custom design tokens.
- **PERFORMANCE**: Beware that `./gradlew` is slow in this environment. Do not run parallel builds.

---
*Documented by Antigravity Core.*
