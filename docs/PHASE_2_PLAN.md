# Sziget Insider 2026: Phase 2 - Refining & Hardening

The core native migration is complete. All major screens (Home, Discover, Map, Passport, Tools) exist and are wired together.

## 🏁 Current Status
- **UI Architecture**: Complete (Jetpack Compose with Material 3).
- **Navigation**: Complete (Fluid Bottom Bar).
- **Data Layer**: Prepared (Room Database + Repository layer).
- **Assets**: All JSON sources migrated.

---

## 🛠️ Next Implementation Tasks (Atomic)

### 1. Data-UI Binding (The "Dynamic" Update)
Most screens currently use `remember { ... }` with placeholder lists or limited repository calls.
- **Task**: Implement ViewModels for `DiscoverScreen` and `HomeScreen`.
- **Goal**: Connect the `LineupRepository` to a `StateFlow` so the UI reacts to real JSON data automatically.

### 2. Room Persistence Hookup
The sub-agents built the `AppDatabase`, but the screens themselves aren't writing to it yet.
- **Task**: Update the `PassportScreen` to save unlocked stamps to Room.
- **Task**: Update `ArtistCard` to allow "Favoriting" (saving to the `FavoriteArtist` entity).

### 3. Tactical Map Integration
Currently, the `MapScreen` is a high-fidelity static UI.
- **Task**: Implement a simple coordinate-based "POI List" view that shows distances from a mock "Center of Island" coordinate.
- **Goal**: Make the categories (Water, Stages, Food) actually filter the list of POIs.

### 4. Polish & Transitions
- **Task**: Add custom entering/exiting animations for the `NavHost` inside `Navigation.kt`.
- **Task**: Implement a "Splash Screen" with the Brutalist Logo that fades into the `HomeScreen`.

---

## 🚦 Integration Workflow
When working with multiple agents, follow these rules:
1. **No Parallel Builds**: If one agent is running a build, others must wait.
2. **Commit Often**: Agents should commit their feature as soon as they finish writing the Kotlin files.
3. **Verify Imports**: Ensure any New Screen is imported in `Navigation.kt`.
