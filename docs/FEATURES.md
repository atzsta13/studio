# Feature Status

Honest, current-state inventory. Features are marked by actual build status, not aspiration.

**Legend:**
- ✅ Built and wired — exists in production code
- 🚧 In progress — partially built or in current sprint (Phase 3)
- 📋 Planned — specced in Phase 3 docs, not yet built
- ⏳ Awaiting data — designed, blocked on Sziget publishing schedule/venue data
- ❌ Not built — was mentioned in early docs, deprioritized

---

## Artist Discovery

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Artist grid / list | ✅ | ✅ | 80 artists |
| Search (fuzzy name/genre) | ✅ | ✅ | Real-time filter |
| Filter by festival day | ✅ | ✅ | ~53% of artists have a day |
| Filter by genre | ✅ | ✅ | |
| Filter by vibe/mood | ✅ | ✅ | 100% coverage after backfill |
| Filter by headliner | ✅ | ✅ | 6 headliners |
| Filter by country | ❌ | 🚧 | Android: CountryExplorerSheet in Phase 3 |
| Sort A–Z / headliners first | ✅ | ✅ | |
| Artist detail page | ✅ | ✅ | Bio, genres, vibes, socials, image |
| "More Like This" (similar artists) | ❌ | 🚧 | Android: Phase 3 Agent C |
| Vibe DNA Quiz | ❌ | 🚧 | Android: Phase 3 Agent B (in progress) |
| 2025 vs 2026 lineup diff | ❌ | 🚧 | Android: Phase 3 Agent D |
| "Serendipity" random discovery | ❌ | 📋 | Android: Phase 3 Agent D |
| AI natural language recommendations | ✅ | ❌ | Web only — requires Gemini API key |
| Spotify match engine | ✅ | ❌ | Web only — OAuth flow |

---

## Schedule & Planning

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Day-based artist schedule | 🚧 | ✅ | Android: day tabs, no times |
| Stage/time timetable grid | ⏳ | ⏳ | Data not published by Sziget yet |
| Clash detection | ⏳ | ⏳ | Logic built in Android; no time data to run it on |
| Personal lineup planner / favorites by day | ❌ | 📋 | Phase 3: MyLineupScreen |
| Shareable lineup card (image export) | ❌ | 📋 | Phase 3: LineupCardExporter |
| Set reminders / notifications | ❌ | 📋 | Requires time data + WorkManager |

---

## Map

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| POI map (water, toilets, first aid) | ✅ | ✅ | 8 POIs |
| Category filter | ✅ | ✅ | ALL / STAGES / FOOD / WATER |
| Hydration mode (water-only highlight) | ✅ | ✅ | Android: pulsing cyan animation |
| Nearest water station indicator | ❌ | ✅ | Android: Phase 3 Agent A |
| Proper coordinate scaling | ✅ | ✅ | Android: fixed in Phase 3 Agent A |
| Real venue/stage locations | ⏳ | ⏳ | Awaiting Sziget map data |
| GPS / real-time positioning | ❌ | ❌ | Not planned — no georeferenced map |
| Food vendor map | 🚧 | 🚧 | Placeholder data only |

---

## Gamification & Passport

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Stamp collection | ✅ | ✅ | Predefined stamps |
| XP / rank system | ✅ | ✅ | Room-persisted on Android |
| Challenge system | ❌ | ✅ | Android: Phase 3 Agent E — 7 challenges |
| Favoriting artists | ✅ | ✅ | Room-persisted on Android |
| Must-see artist marking | ❌ | 📋 | Phase 3: MyLineupScreen DB extension |

---

## Survival Toolkit

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| HUF currency converter | ✅ | ✅ | Hardcoded rate — update manually |
| SOS strobe beacon | ❌ | ✅ | Android: full-screen flash overlay |
| Emergency contacts (dials) | ❌ | ✅ | Android: 112, medical, security |
| Festival survival guide | ❌ | ✅ | Android: Phase 3 Agent E — 8 sections |
| Hungarian phrase clipboard | ❌ | ✅ | Android: tap to copy + haptic + snackbar |
| Packing list | ❌ | ❌ | Was in early design; deprioritized |
| UV safety indicator | ❌ | ❌ | Deprioritized |
| Sound meter | ❌ | ❌ | Deprioritized |

---

## Cross-cutting

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Offline-first | ✅ | ✅ | All data bundled; images need connection |
| Brutalist dark UI | ✅ | ✅ | OLEDBlack, neon accents |
| Haptic feedback | ❌ | ✅ | Android: HapticManager on all interactions |
| Animated splash screen | ❌ | ✅ | |
| Page transitions (fade) | ❌ | ✅ | NavHost enter/exit transitions |
| Country flag emoji rendering | ✅ | ✅ | |

---

## Planned but not yet specced

Features that have been discussed but have no implementation spec yet:

- **Spotify integration on Android** — OAuth, match Spotify library against lineup
- **Push notifications** — day-of reminders for headliners (WorkManager)
- **Friend sync / shared wishlists** — requires a backend; out of scope currently
- **Web → Android feature parity pass** — bring Android-only features (guide, quiz, challenges) to web

---

## Data dependencies

Some features cannot be built until Sziget publishes official data:

| Blocked feature | Missing data | Where to add when available |
|----------------|-------------|---------------------------|
| Full timetable | `stage`, `startTime`, `endTime` per artist | `src/data/lineup.json` → sync to Android assets |
| Clash detection (real) | Same as above | ScheduleScreen already has the logic |
| Real food map | 2026 food vendor list with locations | `android/app/src/main/assets/food.json` |
| Stage-specific map pins | Stage coordinates | `android/app/src/main/assets/poi.json` |

See [`docs/PHASE_3_PLAN.md`](PHASE_3_PLAN.md) for the full implementation roadmap.
