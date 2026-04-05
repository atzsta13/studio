# 🧩 Sziget Insider Phase 2: Atomic Agent Tasks

Use these 5 blocks to launch 5 parallel sub-agents. 

**STRICT GLOBAL RULES:**
1. **NO GRADLE:** Do NOT run `./gradlew` or any build commands.
2. **STYLE**: Follow the "Neon Brutalism" guide exclusively.
3. **LOGIC**: Use the `data/` repositories already present (Lineup, POI, Food).

---

### 🟦 AGENT 1: The Favorite-Artist Hook (Persistence)
**Task**: Enable "Favoriting" for individual artists.
**Instructions**:
1. Create `ui/discover/ArtistViewModel.kt`.
2. Implement functions `toggleFavorite(artistId: String)` that write to the `UserDao` (Room Database).
3. Use `StateFlow` to track the list of favorited IDs.
4. Update `ui/components/ArtistCard.kt` to show a filled/unfilled magenta star based on this state.

**Instructions**:
4. Reference: `android/.../data/local/UserDao.kt`.

### 🟩 AGENT 3: Reactive Discover Engine (Data Binding)
**Task**: Build a reactive ViewModel for the Artist List.
**Instructions**:
1. Create `ui/discover/DiscoverViewModel.kt`.
2. Use `LineupRepository` to fetch artists. 
3. Expose a `StateFlow<List<Artist>>` to the `DiscoverScreen`.
4. Ensure the `selectedVibe` filter logic happens inside the ViewModel, not the UI Composable.

### 🟥 AGENT 4: Tactical Map POI Filtering (Data Binding)
**Task**: Bind the Map categories (Water, Food, Stages) to real POI data.
**Instructions**:
1. Create `ui/map/MapViewModel.kt`.
2. Use `POIRepository` to fetch all points of interest from `poi.json`.
3. Track the `activeCategory` (Water, Food, Stage).
4. Expose a filtered list of `POI` objects. The `MapScreen` should display these POIs as stylized "Tac-Dots" on the list/map.

### ⬜ AGENT 5: Navigation Polish & Splash (UI Polish)
**Task**: Implement "Neon" transitions and the initial Splash experience.
**Instructions**:
1. Add `enterTransition` and `exitTransition` to the `NavHost` in `ui/navigation/Navigation.kt` (simple fades/slides).
2. Create `ui/splash/SplashScreen.kt`.
3. Design a massive, centering "SZIGET INSIDER" brutalist logo.
4. Use a `LaunchedEffect(Unit) { delay(2000); navController.navigate("home") }` to transition to the main app.
5. Update `MainActivity.kt` to start at `splash` instead of `home`.
