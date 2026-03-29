# Phase 1 Implementation Checklist — COMPLETE ✅

Phase 1 goal: **extract all hardcoded Sziget values into config on both platforms**. Zero visible product change. Zero new features. After Phase 1, deploying a second festival requires only a new config entry + data package.

---

## Web Tasks

### WEB-01 — Create `src/config/festival.ts`
- [x] **Action**: Create the file exactly as specified in `02_CONFIG_SYSTEM.md`.
- [x] **Verify**: `npx tsc --noEmit` passes. `import { FESTIVAL } from '@/config/festival'` resolves.

### WEB-02 — Rename `szigetUrl` → `festivalUrl` in types
- [x] **File**: `src/types/index.ts`. Rename field in interface.
- [x] **Data**: Rename field in all `lineup.json` records.

### WEB-03 — Update `src/app/layout.tsx`
- [x] **Action**: Dynamic metadata and CSS variable injection for themes.

### WEB-04 — Update weather API route
- [x] **Action**: Read coordinates from `FESTIVAL.location` instead of hardcoded Budapest.

### WEB-05 — Update festival countdown component
- [x] **Action**: Use `FESTIVAL.dates.startDate` and `FESTIVAL.appName`.

### WEB-06 — Update home page opening day filter
- [x] **Action**: Read filter day from `FESTIVAL.dates.openingDayFilter`.

### WEB-07 — Update challenges.ts
- [x] **Action**: Use dynamic `FESTIVAL.dates.days` and dynamic ranks (e.g., "${name} Legend").

### WEB-08 — Update AI recommendation flow
- [x] **Action**: Parameterize Scout persona and Festival name in system prompt.

### WEB-09 — Update header and weather widget
- [x] **Action**: Dynamic labels for header and weather display name.

### WEB-10 — Create `scripts/generate-manifest.mjs`
- [x] **Action**: Auto-generate `manifest.json` based on active festival colors/names.

### WEB-11 — Create `scripts/sync-data.mjs`
- [x] **Action**: Pull JSON data from `festivals/<id>/data/` into `src/data/` at build time.

### WEB-12 — Feature flag gates in Tools
- [x] **Action**: Gate Currency Converter, Cashless Link, and Hungarian Phrases.

---

## Android Tasks

### AND-01 — Add product flavors to `build.gradle.kts`
- [x] **Action**: Added `sziget`, `area53`, `novarock`, `frequency` flavors.

### AND-02 — Create per-flavor asset directories
- [x] **Action**: Set up `src/<flavor>/assets` and implemented `sync-android-assets.mjs`.

### AND-03 — Update `FestivalConfig.kt`
- [x] **Action**: Implemented dynamic switching on `BuildConfig.FESTIVAL_ID`.

### AND-04 — Update `AndroidManifest.xml` deep link
- [x] **Action**: Used `${deepLinkScheme}` placeholder.

### AND-05 — Update `MainActivity.kt`
- [x] **Action**: Dynamic Spotify callback scheme check.

### AND-06 — Update `Theme.kt`
- [x] **Action**: Colors driven by `FestivalConfig`. Renamed to `FestivalInsiderTheme`.

### AND-07 — Update `AppDatabase.kt`
- [x] **Action**: Dynamic database name per festival (no data cross-contamination).

### AND-08 — Dynamicize Storage Keys
- [x] **Action**: Prepended `FestivalConfig.current.id` to SharedPreferences keys.

---

## Phase 1 Complete — Definition of Done

- [x] `grep -rn "Sziget" src/` returns only config entries and data files.
- [x] `grep -rn "Wednesday" src/` outside of config returns zero results (using openingDayFilter instead).
- [x] All four `NEXT_PUBLIC_FESTIVAL_ID=xxx npm run build` commands succeed.
- [x] All four Android flavor debug builds succeed.
- [x] Existing Sziget functionality is unchanged (spot-checked: countdown, weather, AI, Spotify, passport).
- [x] `npm run typecheck` passes (all 20 pre-existing and 5 new errors resolved).
- [x] `npm run lint` passes.
