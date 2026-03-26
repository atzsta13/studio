# 🗂️ Sziget Insider 2026: Comprehensive Ecosystem & State Manifest
**Target Platforms:** Native Android (Jetpack Compose) + Next.js Web (React)
**Date:** 2026-03-25
**Status:** Phase 3 (Social & Tactical)

---

## 🕰️ Project Evolution & Context
Sziget Insider 2026 is a **Cross-Platform Ecosystem** designed to provide a unified, offline-first experience for festival-goers across web and mobile.

1.  **Stage 1: The Firebase Era**: Originally conceived as a web application utilizing **Firebase Studio** for real-time cloud data and authentication.
2.  **Stage 2: The Local Web Implementation**: Transitioned to a **Next.js** App Router architecture. During this phase, the project pivoted to a **Local-First** model, ensuring the app functions perfectly in high-density, low-connectivity festival environments.
3.  **Stage 3: The Native Android Expansion (Current)**: The project has expanded to include a **Native Android (Kotlin + Jetpack Compose)** app alongside the Web version. This provides deeper hardware integration (Flashlight/SOS) and superior mobile performance while sharing the same "Offline-First" source of truth (`lineup.json`).

---

## 🏛️ System Architecture Overview

### 1. Unified Design Language: Neon Brutalism
Both platforms share a "Neon Brutalist" design system.
- **Web**: Tailwind CSS 4 with custom Acid/OLED palette.
- **Android**: `ui.theme.Theme.kt` with Acid/OLED colors and custom `BrutalistTypography`.

### 2. Data Strategy: Shared Offline-First Source
- **Source of Truth**: `src/data/lineup.json` is the master file for both platforms.
- **Sync Mechanism**: `sync.sh` bridges the web assets to the Android `assets/` folder.
- **Persistence**:
  - **Web**: LocalStorage / IndexedDB for user favorites and progress.
  - **Android**: Room Database (`AppDatabase.kt`) for XP, Stamps, and Favorites.

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
