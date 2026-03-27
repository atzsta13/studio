# Phase 1 Implementation Checklist

Phase 1 goal: **extract all hardcoded Sziget values into config on both platforms**. Zero visible product change. Zero new features. After Phase 1, deploying a second festival requires only a new config entry + data package.

Estimated time: 2 weeks (1 developer).

---

## Before You Start

```bash
# Confirm clean state
git checkout claude/white-label-research-L9QyD
git pull origin claude/white-label-research-L9QyD
npm run typecheck   # must pass
npm run lint        # must pass
npm run build       # must succeed
```

Create a feature branch off the research branch:
```bash
git checkout -b feature/phase1-config-extraction
```

---

## Web Tasks

### WEB-01 — Create `src/config/festival.ts`
- **Action**: Create the file exactly as specified in `02_CONFIG_SYSTEM.md`.
- **Verify**: `npx tsc --noEmit` passes. `import { FESTIVAL } from '@/config/festival'` resolves in any file.
- **Commit**: `feat(config): add FestivalConfig interface and all four festival configs`

---

### WEB-02 — Rename `szigetUrl` → `festivalUrl` in types

**File**: `src/types/index.ts`

```bash
# Find all usages first
grep -rn "szigetUrl" src/
```

Expected hits: `src/types/index.ts` (definition) + any components that render the field.

```typescript
// src/types/index.ts — find and change:
szigetUrl?: string
// →
festivalUrl?: string
```

Also update `src/data/lineup.json` — rename the field in all ~80 artist records:

```bash
# Quick sed one-liner (run from repo root)
sed -i 's/"szigetUrl"/"festivalUrl"/g' src/data/lineup.json
```

- **Verify**: `grep "szigetUrl" src/` returns no results.
- **Commit**: `refactor(types): rename szigetUrl to festivalUrl`

---

### WEB-03 — Update `src/app/layout.tsx`

Replace metadata and add CSS variable injection as shown in `04_WEB_IMPLEMENTATION.md` section 2.

- **Verify**: Run `npm run dev`. Open browser, check `<title>` tag in source. Check that `--primary` CSS var is `326 100% 50%` in DevTools.
- Then test: `NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run dev` → title should be "Area 53 Insider 2026", `--primary` should be `0 100% 40%` (red).
- **Commit**: `feat(layout): inject festival theme from config as CSS custom properties`

---

### WEB-04 — Update weather API route

**File**: `src/app/api/weather/route.ts`

Replace the two hardcoded lines (Budapest lat/lng/timezone) with config values as shown in `04_WEB_IMPLEMENTATION.md` section 3.

- **Verify**: `curl http://localhost:9002/api/weather` returns JSON with location matching the festival. Test again with `NEXT_PUBLIC_FESTIVAL_ID=area53-2026` — the forecast should be for Leoben, Austria.
- **Commit**: `fix(weather): read coordinates from FestivalConfig instead of hardcoded Budapest`

---

### WEB-05 — Update festival countdown component

**File**: `src/components/home/festival-countdown.tsx`

Replace hardcoded dates and text as shown in `04_WEB_IMPLEMENTATION.md` section 4.

- **Verify**: Countdown shows correct dates. "DAYS UNTIL SZIGET 2026" reads from config. Switch to `area53-2026` → shows "DAYS UNTIL AREA 53 2026" and July dates.
- **Commit**: `fix(countdown): use festival dates and name from FestivalConfig`

---

### WEB-06 — Update home page opening day filter

**File**: `src/app/page.tsx`

```typescript
// Change one line:
.filter(a => a.day === 'Wednesday')
// →
.filter(a => a.day === FESTIVAL.dates.openingDayFilter)
```

- **Verify**: Home screen still shows the Sziget opening-day headliners. For area53-2026, verify it would filter on "Thursday".
- **Commit**: `fix(home): read opening day filter from FestivalConfig`

---

### WEB-07 — Update challenges.ts

**File**: `src/lib/challenges.ts`

```typescript
// BEFORE
const FESTIVAL_DAYS = ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday']

// AFTER
import { FESTIVAL } from '@/config/festival'
const FESTIVAL_DAYS = FESTIVAL.dates.days
```

- **Verify**: Passport challenges still work. The "Full Week Warrior" challenge should auto-scale to 3 days for Area 53 (Thursday–Saturday only).
- **Commit**: `fix(challenges): use festival days list from FestivalConfig`

---

### WEB-08 — Update AI recommendation flow

**File**: `src/ai/flows/recommend-artists-flow.ts`

Replace the hardcoded system prompt persona string as shown in `04_WEB_IMPLEMENTATION.md` section 7.

- **Verify**: Run `npm run genkit:dev`. Submit a prompt. The AI response should reference the festival from config (e.g., "Area 53" when `FESTIVAL_ID=area53-2026`), not "Sziget".
- **Commit**: `fix(ai): parameterize recommendation scout persona from FestivalConfig`

---

### WEB-09 — Update header and weather widget

**Files**: `src/components/layout/header.tsx`, `src/components/tools/weather-widget.tsx`

Replace the two hardcoded strings as shown in `04_WEB_IMPLEMENTATION.md` sections 8 and 9.

- **Verify**: Header shows "Sziget Insider 2026" (unchanged). For area53-2026 → "Area 53 Insider 2026". Weather widget shows "Budapest · Óbudai-sziget" for Sziget, "Leoben · VAZ Schladnitz" for Area 53.
- **Commit**: `fix(ui): replace hardcoded festival name and location strings with config`

---

### WEB-10 — Create `scripts/generate-manifest.mjs`

Create the script as shown in `03_DATA_PIPELINE.md`. Update `package.json`:

```json
"prebuild": "node scripts/generate-manifest.mjs"
```

- **Verify**: `NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run build` produces a `public/manifest.json` with `"name": "Area 53 Insider 2026"` and `"theme_color": "#CC0000"`.
- **Commit**: `feat(pwa): generate manifest.json from FestivalConfig at build time`

---

### WEB-11 — Create `scripts/sync-data.mjs`

Create the script as shown in `03_DATA_PIPELINE.md`. Create `festivals/sziget-2026/data/` and copy existing JSON files there.

```bash
mkdir -p festivals/sziget-2026/data
cp src/data/lineup.json    festivals/sziget-2026/data/
cp src/data/poi.json       festivals/sziget-2026/data/
cp src/data/food.json      festivals/sziget-2026/data/
cp src/data/guide.json     festivals/sziget-2026/data/
```

Update `package.json`:
```json
"predev": "node scripts/sync-data.mjs",
"prebuild": "node scripts/sync-data.mjs && node scripts/generate-manifest.mjs"
```

- **Verify**: `npm run dev` still starts correctly (data files present in `src/data/`).
- **Commit**: `feat(data): add per-festival data packages under festivals/ directory`

---

### WEB-12 — Feature flag gates in Tools

Wrap `CurrencyConverter` and any other feature-gated tools as shown in `04_WEB_IMPLEMENTATION.md` section 10.

- **Verify**: For `sziget-2026`, currency converter is visible. For `area53-2026`, it is not rendered.
- **Commit**: `feat(tools): gate currency converter and cashless link behind feature flags`

---

### WEB-13 — Run full typecheck + build

```bash
npm run typecheck
npm run lint
npm run build

# Also verify non-default festival builds
NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run build
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run build
NEXT_PUBLIC_FESTIVAL_ID=frequency-2026 npm run build
```

All four builds must succeed without TypeScript errors.

- **Commit**: (no new commit — this is the final verification step)

---

## Android Tasks

### AND-01 — Add product flavors to `build.gradle.kts`

Add the full product flavor block as shown in `05_ANDROID_IMPLEMENTATION.md` step 2. Do not rename the package yet — that can be a separate PR.

- **Verify**: Android Studio syncs without errors. Flavor selector shows `szigetDebug`, `area53Debug`, `novarockDebug`, `frequencyDebug`.
- **Commit**: `feat(android): add product flavors for all four festivals`

---

### AND-02 — Create per-flavor asset directories

```bash
mkdir -p android/app/src/sziget/assets
mkdir -p android/app/src/area53/assets
mkdir -p android/app/src/novarock/assets
mkdir -p android/app/src/frequency/assets

# Sync Sziget data to its flavor directory
npm run android:sync:sziget
```

Place stub `lineup.json` (empty array `[]`) in the other three flavor directories for now — they'll be populated in Phase 2/3.

- **Verify**: Build `assembleSzigetDebug` succeeds. Flavor assets directory picked up.
- **Commit**: `feat(android): create per-flavor asset directories`

---

### AND-03 — Update `FestivalConfig.kt`

Replace with the full config shown in `02_CONFIG_SYSTEM.md`, switching on `BuildConfig.FESTIVAL_ID`.

- **Verify**: Build `assembleSzigetDebug` — app runs as before. Build `assembleArea53Debug` — `FestivalConfig.NAME` returns "Area 53".
- **Commit**: `feat(android): FestivalConfig switches on BuildConfig.FESTIVAL_ID`

---

### AND-04 — Update `AndroidManifest.xml` deep link

Replace hardcoded `sziget` scheme with `${deepLinkScheme}` placeholder as shown in step 5.

- **Verify**: Build each flavor. Spotify OAuth redirect opens the correct flavor's app.
- **Commit**: `fix(android): deep link scheme from manifest placeholder per flavor`

---

### AND-05 — Update `MainActivity.kt`

Replace hardcoded `"sziget"` scheme string check as shown in step 6.

- **Commit**: `fix(android): read deep link scheme from FestivalConfig`

---

### AND-06 — Update `Theme.kt`

Replace color hardcoding as shown in step 7. Rename `SzigetInsiderTheme` → `FestivalInsiderTheme`.

- **Verify**: `szigetDebug` still shows magenta primary. `area53Debug` shows red primary. `novarockDebug` shows orange.
- **Commit**: `feat(android): theme colors driven by FestivalConfig per flavor`

---

### AND-07 — Update `WeatherRepository.kt`

Replace hardcoded Budapest coordinates as shown in step 8.

- **Verify**: Tools screen in `area53Debug` fetches weather for Leoben (47.38°N, 15.09°E).
- **Commit**: `fix(android): weather API coordinates from FestivalConfig`

---

### AND-08 — Update `DiscoverViewModel.kt` and `HomeScreen.kt`

Replace hardcoded `dayOrder` and opening day filter as shown in steps 9 and 10.

- **Commit**: `fix(android): festival day lists from FestivalConfig`

---

### AND-09 — Update `ToolsScreen.kt` feature flags

Wrap currency converter and cashless link as shown in step 11.

- **Verify**: `szigetDebug` shows currency converter. `area53Debug` hides it. `novarockDebug` shows cashless wallet link.
- **Commit**: `feat(android): feature flag gates in Tools screen from FestivalConfig`

---

### AND-10 — Update `strings.xml`

Remove `app_name` (it's now a `resValue`). Build all flavors — each should show the correct app name in the launcher.

- **Commit**: `chore(android): remove app_name from strings.xml (now set per flavor)`

---

### AND-11 — Build all flavors

```bash
cd android
./gradlew assembleSzigetDebug
./gradlew assembleArea53Debug
./gradlew assembleNovarockDebug
./gradlew assembleFrequencyDebug
./gradlew test   # unit tests
```

All builds must succeed. No compilation errors.

---

## Merge and Push

```bash
# On feature branch
git push origin feature/phase1-config-extraction

# After review, merge to research branch
git checkout claude/white-label-research-L9QyD
git merge --no-ff feature/phase1-config-extraction
git push origin claude/white-label-research-L9QyD
```

---

## Phase 1 Complete — Definition of Done

- [ ] `grep -rn "Sziget" src/` returns only data files (`lineup.json`, `guide.json`) and the Sziget config entry — no component, page, or API route contains a Sziget literal
- [ ] `grep -rn "47.5194\|19.0512\|Budapest\|Óbudai" src/` returns zero results outside config
- [ ] `grep -rn "Wednesday" src/` outside of config returns zero results
- [ ] `grep -rn "Sziget Insider Scout" src/` returns zero results outside config
- [ ] All four `NEXT_PUBLIC_FESTIVAL_ID=xxx npm run build` commands succeed
- [ ] All four Android flavor debug builds succeed
- [ ] Existing Sziget functionality is unchanged (spot-check: countdown, weather, AI, Spotify, passport)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
