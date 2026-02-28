# Sziget Insider 2026 - Native Android Port Plan

This document outlines the current status, master plan, and a breakdown of atomic, easily parallelizable tasks required to port the cutting-edge Next.js Sziget Insider application into a fully native Android app using Jetpack Compose.

---

## 🟢 Current Status: Foundation Complete
*The baseline infrastructure for the Android port is finished and compiling successfully.*

1. **Gradle Setup**: The project is configured with `compileSdk = 35` and `minSdk = 26`, using `jetpack-compose`, `navigation-compose`, and `kotlinx-serialization`.
2. **Neon Brutalism Theme Engine**: The UI/UX tokens (OLED Black, Acid Yellow, Primary Magenta) and the Brutalist Typography (Font-Black, Italic, Uppercase) have been natively implemented in `/ui/theme/`. System bars are forced to stealth OLED black.
3. **Offline-First Data Pipeline**: `lineup.json`, `lineup_2025.json`, and `food.json` have been copied to `assets/`. A robust `Artist` data class and `LineupRepository` have been written to parse this data natively without internet.
4. **App Scaffolding**: `MainActivity.kt` now hosts a `FluidBottomNavigation` scaffolding mapping out the 5 core tabs (Home, Discover, Map, Guide, Tools).

---

## 🎯 The Master Plan
The overarching goal is to achieve 1:1 feature parity with the "Elite 33" features of the web application. Because the foundation and data models are established, future work can be distributed across multiple independent agents (or developers) working simultaneously.

1. **Data Layer**: Build out the remaining repositories parsing the local JSON and create the Room Database for persisting user data (favorites, XP).
2. **Screen Layer**: Replace the Text placeholders in the Navigation Scaffold with fully functional Jetpack Compose screens.
3. **Component Layer**: Abstract out reusable UI items (e.g., `ArtistCard`, `VibePill`, `SurvivalButton`) so screens can be built rapidly.
4. **Hardware Integrations**: Bind native Android APIs to features (e.g., Camera Flash for SOS Beacon, local Notifications for the Timetable).

---

## 🤖 Atomic Agentic Tasks (Parallelizable)
*The following tasks are highly isolated. Agents can pick these up and execute them concurrently without creating merge conflicts, as they operate in distinct files/packages.*

### Data & Architecture Agents
- [ ] **Task: Local Database (Room) Implementation**
  - **Goal**: Implement `AppDatabase`, `UserDao`, and `UserPreferences` entity to store "Favorited Artists", "Stamps Collected", and "Legend XP".
  - **File Scope**: `data/local/*`

- [ ] **Task: Food Repository Implementation**
  - **Goal**: Create the `FoodVendor` Kotlin Data Class and `FoodRepository` that parses `assets/food.json` using `kotlinx.serialization`. 
  - **File Scope**: `data/model/FoodVendor.kt`, `data/repository/FoodRepository.kt`

### Feature UI Agents
- [ ] **Task: Build `DiscoverScreen` (Artist Grid & Filter UI)**
  - **Goal**: Build a `LazyVerticalGrid` that displays `ArtistCard` components. Add the horizontal scrolling "Vibes" pills selector. Bind it to a dummy ViewModel calling `LineupRepository`.
  - **File Scope**: `ui/discover/*`

- [ ] **Task: Build `PassportScreen` (Gamification UI)**
  - **Goal**: Design the Progress Bar for Legendary XP and a CSS-Grid equivalent Jetpack Compose layout for the Brutalist Stamp Cards.
  - **File Scope**: `ui/passport/*`

- [ ] **Task: Build `ToolsScreen` (Survival Toolkit)**
  - **Goal**: Create the UI for the HUF Converter, SOS Flashlight Button, and Emergency Calling cards.
  - **File Scope**: `ui/tools/*`

- [ ] **Task: Components Refactoring - `ArtistCard`**
  - **Goal**: Build a standalone `@Composable fun ArtistCard(artist: Artist)` matching the web aesthetic (Heavy borders, magenta glowing text on hover/click, flag emojis from country code).
  - **File Scope**: `ui/components/ArtistCard.kt`

- [ ] **Task: Build `MapScreen` (Static Navigation Layer)**
  - **Goal**: Implement the panning/zooming map facade. Draw the "Music" vs "Food" UI filter chips mimicking the NextJS map interface.
  - **File Scope**: `ui/map/*`
