# 🚀 Sziget Insider 2026: The Native Migration Manifest

This document is for the **Meta-Orchestrator Agent**. It contains the strict rules and partitioned task blocks for the concurrent Android migration.

---

## 🛠️ Global Rules for All Sub-Agents

1.  **NO GRADLE BUILDS:** Do NOT run `./gradlew` or any build commands. Multiple agents are working in parallel; sync/build will lock the filesystem. 
2.  **OFFLINE-FIRST ONLY:** Use local JSON assets and Room/DataStore. No network calls.
3.  **UI FIDELITY:** Port the exact "Neon Brutalism" feel from the React source. Use `ui/theme/Color.kt` for all styling.
4.  **RESOURCES:**
    *   **Data Models**: Read `android/.../data/model/Artist.kt`
    *   **Repositories**: Use `android/.../data/repository/LineupRepository.kt`
    *   **Colors**: Use `com.example.szigerinsider2026.ui.theme.*`

---

## 📋 Task Distribution List

### 🟦 AGENT 1: Persistence Layer (Task A)
**Scope**: `android/.../data/local/`
1.  Add Room dependencies to `build.gradle.kts`.
2.  Create `UserProgress` entity (XP, Stamps, Rank).
3.  Create `FavoriteArtist` entity.
4.  Create `AppDatabase.kt` and `UserDao.kt`.

### 🟨 AGENT 2: UI Building Blocks (Task B)
**Scope**: `android/.../ui/components/`
1.  Create `ArtistCard.kt`. 
2.  Reference standard: Heavy borders, black backgrounds, magenta accents. 
3.  Map the `Artist` model to the UI.

### 🟩 AGENT 3: Survival Tools (Task D)
**Scope**: `android/.../ui/tools/`
1.  Create `ToolsScreen.kt`.
2.  Implement HUF/EUR/USD converter logic.
3.  Implement SOS/Emergency Action Buttons (Native Intents).

### 🟥 AGENT 4: Discover Engine (Task C)
**Scope**: `android/.../ui/discover/`
1.  Create `DiscoverScreen.kt`.
2.  Implement `LazyVerticalGrid` parsing the full `LineupRepository`.
3.  Add "Vibe" filtering chips at the top.

### 🟪 AGENT 5: Gamification Engine (Task E)
**Scope**: `android/.../ui/passport/`
1.  Create `PassportScreen.kt`.
2.  Design the "Legend XP" progress bar and Rank card.
3.  Draw the grid of 3D-styled Stamp cards using `Surface` wrappers for heavy borders.
4.  Reference Logic: `src/app/passport/page.tsx`.

### ⬜ AGENT 6: Home Landing (Task F)
**Scope**: `android/.../ui/home/`
1.  Create `HomeScreen.kt`.
2.  Implement the large "Strategic Grid" of cards (Map, Food, Discover, Toolkit).
3.  Draw the "XP Legend Card" at the very top.

---

## 🚦 Post-Migration Workflow
Once all sub-agents report "COMPLETE", the User will signal the **Main Agent** to perform a **Unified Build Sync** and resolve any inter-module link errors.
