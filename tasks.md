# Sziget Insider 2026: Android Port Migration State

This document captures the current state of the native Android port for the next autonomous agent to pick up.

## 🏁 Current Milestone: Phase 2 - Refining & Hardening
The foundational UI and data structures are mostly in place. We are currently fixing inter-system dependencies and starting the unified build process.

## 🏗️ Project Structure (Native Android)
- **UI Architecture**: Jetpack Compose using a "Neon Brutalism" custom theme (`ui/theme/`).
- **Navigation**: Centrally managed in `ui/navigation/Navigation.kt`. Includes a `SplashScreen` and a `FluidBottomNavigation`.
- **Data Layer**:
    - **Room Database**: `AppDatabase.kt` manages user progress and favorite artists.
    - **Repositories**: `LineupRepository`, `POIRepository`, and `FoodRepository` parse local JSON assets from the `assets/` directory (Offline-First).
- **ViewModels**: Added for Passport, Discover, Map, and Artist logic to separate state from UI.

## ✅ Completed (Needs Final Build Verification)
- [x] Initial Native Scaffold with Material 3.
- [x] Brutalist Design Tokens (Colors, Typography).
- [x] Bottom Navigation with 5 tabs (Home, Discover, Map, Passport, Tools).
- [x] Asset logic for Lineup, POI, and Food data.
- [x] Splash Screen implementation with transitions.
- [x] ViewModels for Core Screens.
- [x] Room Entity/DAO setup for persistence.

## 🚧 Pending / Next Steps
1. **Unified Compilation Verification**:
    - Run `./gradlew app:assembleDebug` in the `/android` directory.
    - **Note**: This command is slow and prone to timing out in remote environments. Monitor the output carefully.
    - Resolve any remaining "Unresolved Reference" errors (likely imports for new ViewModels or Extended Material Icons).
2. **Feature Deep-Link Verification**:
    - Connect `ArtistCard` "Favorite" action to `ArtistViewModel`.
    - Ensure `PassportScreen` accurately reflects the Room database state for stamps.
    - Verify `MapScreen` filtration logic across POI categories (Stages, Water, Food).
3. **UI Polish**:
    - Finalize "Neon" entrance/exit transitions between screens.
    - Review `HomeScreen` "Island Pulse" (Now Playing) logic for real-time accuracy.
4. **Hardware Integrations (Future)**:
    - Native Android SOS Flashlight control.
    - Offline notification triggers for scheduled artists.

## ⚠️ Important Environment Notes
- **Gradle Builds**: Run them sparingly and one at a time. They lock the file system.
- **Offline-First**: DO NOT ADD NETWORK LIBRARIES. Everything must come from `assets/*.json` or `Room`.
- **Dependencies**: New dependencies (Coil, Lifecycle Compose, Material Icons Extended) have been added to `libs.versions.toml`.

---
*Signed by Antigravity (Phase 1 Architect).*
