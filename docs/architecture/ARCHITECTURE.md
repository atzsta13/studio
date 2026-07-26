# Open Festival Hub — Architecture Reference

> Written for AI models and new engineers joining cold. Read this before touching any code.

---

## What This Is

A multi-festival, **100% offline-first** companion app. Two parallel codebases sharing the same JSON data:

| Platform | Stack | Entry point |
|---|---|---|
| **Web** | Next.js 16 / React 19, fully static export | `src/app/` |
| **Android** | Jetpack Compose / Kotlin | `android/app/src/main/` |

There is **no backend, no server, no API routes, no auth, no accounts**. Everything runs from static JSON bundled or fetched at runtime.

Festivals supported: Sziget, Nova Rock, Frequency, Area 53, Ernte Punk, Rock am Ring.

---

## Repo Layout

```
/                           ← Next.js web app root
  src/
    app/
      [festivalId]/         ← Per-festival pages (discover, map, timetable, …)
      page.tsx              ← Hub page — lists all festivals as cards
    components/
      layout/
        header.tsx          ← Sticky header with FestivalSwitcher + ModeToggle (all screen sizes)
        festival-switcher.tsx ← Dropdown to switch between festivals
        bottom-nav.tsx      ← Mobile bottom nav (MUI)
        insider-provider.tsx← Context: loads lineup.json, exposes useInsider()
    config/
      festival-engine.ts    ← FESTIVAL_CONFIGS map, getFestivalConfig(), FestivalConfig interface
  public/data/<id>/         ← Statically served JSON fetched at runtime
  festivals/
    <festival-id>/
      config.json           ← Festival config (theme, features, dates, location, i18n, …)
      data/
        lineup.json         ← Artist roster
        *.json              ← food, guide, poi, survival, etc.
  android/
    app/src/main/
      assets/<id>/          ← Per-festival assets bundled into the APK
      java/…/
        data/config/FestivalConfig.kt      ← Config loader + SharedPreferences selection
        data/local/AppDatabase.kt          ← Room DB singleton (per-festival DB name)
        data/repository/LineupRepository.kt← Loads from assets/<id>/lineup.json
        ui/navigation/Navigation.kt        ← NavHost + bottom nav
        ui/splash/SplashScreen.kt          ← First screen; routes to home or festival_select
        ui/splash/FestivalSelectionScreen.kt← First-launch and switch picker
        ui/home/, discover/, artist/, schedule/, map/, tools/, …
```

---

## Web Architecture

### Static Export

`next.config.ts` sets `output: 'export'` and `basePath: '/studio'`. The build produces a flat `out/` directory deployed to GitHub Pages at `https://atzsta13.github.io/studio/`.

**Critical rule**: every `fetch()` for JSON data must use the `BASE_PATH` helper:

```ts
import { BASE_PATH } from '@/lib/base-path';
fetch(`${BASE_PATH}/data/${festivalId}/lineup.json`);
// '' locally, '/studio' on GitHub Pages — without this, fetches 404 on production
```

### Routing

Pages live under `src/app/[festivalId]/`. `generateStaticParams()` in `[festivalId]/layout.tsx` pre-renders a page tree for every festival ID. The root `src/app/page.tsx` is a hub that lists all festivals.

### Festival Config

All festival identity (theme colors, feature flags, dates, location, i18n) lives in `festivals/<id>/config.json` and is imported statically in `src/config/festival-engine.ts`:

```ts
export const FESTIVAL_CONFIGS: Record<string, FestivalConfig> = { ... }
export function getFestivalConfig(id?: string): FestivalConfig { ... }
```

**Never hardcode** festival names, colors, coordinates, or dates in components. Always read from `getFestivalConfig(festivalId)` or the `FESTIVAL` constant from `InsiderProvider`.

### Festival Switcher

`src/components/layout/festival-switcher.tsx` — a dropdown in the header present on every `[festivalId]/*` page. Shows all festivals with their accent color dot. Clicking one navigates to `/<festival-id>`. The `[festivalId]` URL structure is preserved for deep linking.

### Theme

Each festival defines HSL values in `config.json`. `[festivalId]/layout.tsx` injects them as CSS variables (`--primary`, `--secondary`, `--accent`, `--background`, `--card`) via a `<style>` tag.

Rules:
- In Tailwind: use `text-primary`, `bg-card`, `border-primary`, etc. — never raw hex
- In MUI sx: use `color: 'primary.main'` or `FESTIVAL.theme.primaryHex` — never hardcoded hex
- `mui-registry.tsx` syncs `primaryHex / secondaryHex / glowColor` from config to MUI theme

### Data Loading

`InsiderProvider` (wraps every `[festivalId]` layout) loads `lineup.json` client-side. All user state (favorites, quiz results, progress) is `localStorage`-only, prefixed with `${festivalId}`.

### UI Stack

- **ShadCN** (Radix primitives) — atomic components (Button, Card, DropdownMenu, …)
- **MUI 6** — complex layouts (BottomNavigation, etc.)
- **Tailwind** — utility classes
- **Lucide** — icons (import individually, never barrel-import)
- **Framer Motion** — animations

### Images

Artist images are **hotlinked to source CDN** — never downloaded or self-hosted. Always use `ArtistImage` (`src/components/ui/artist-image.tsx`) which adds a `© source` attribution watermark.

---

## Android Architecture

### Single APK

One APK: `org.openfestivalhub` / "Open Festival Hub". **No product flavors.** All festival data bundled under `src/main/assets/<festival-id>/`:

```
src/main/assets/
  sziget-2026/      config.json  lineup.json  food.json  guide.json  poi.json  …
  novarock-2026/    …
  frequency-2026/   …
  area53-2026/      …
  ernte-punk-2026/  …
  rock-am-ring-2026/…
```

### Festival Selection Flow

```
App launch
  → MainActivity.onCreate()
      FestivalConfig.initialize(context)   // loads saved pref or defaults to "sziget-2026"
      OpenFestivalHubTheme { AppNavigation() }
  → SplashScreen
      FestivalConfig.isSelected(context)?
        yes → navigate("home")
        no  → navigate("festival_select")
  → FestivalSelectionScreen
      user taps a festival card
      → FestivalConfig.switchFestival(context, id)
            writes id to SharedPreferences("festival_insider_prefs", KEY="selected_festival_id")
            calls AppDatabase.resetInstance()   // close + null the Room singleton
            restarts app via packageManager.getLaunchIntentForPackage
  → next launch: isSelected() = true → goes directly to home
```

Switching later (Tools → "Switch Festival" → route `festival_switch`) uses the identical path. Switching always causes a **full app restart** — no in-process state migration.

### FestivalConfig Object

```kotlin
object FestivalConfig {
    val AVAILABLE_IDS: List<String>                            // all 6 festival IDs

    fun initialize(context: Context)                           // call once in MainActivity
    fun isSelected(context: Context): Boolean                  // false if no pref saved yet
    fun switchFestival(context: Context, festivalId: String)  // save + reset DB + restart

    val current: FestivalConfigData   // throws if initialize() not called first
    val NAME, DAYS, DAY_LABELS, TIMEZONE, FEATURES, DEEP_LINK_SCHEME
}
```

`initialize()` loads `<id>/config.json` from assets. If no pref is saved it uses `"sziget-2026"` as default but does **not** write the pref — so `isSelected()` remains false and the selection screen still shows on first launch.

### Room Database

`AppDatabase` names the DB `${festivalId.replace("-","_")}_database`. The singleton is created lazily. `resetInstance()` closes and nulls it so the next access opens the correct festival's DB.

`LineupRepository.getLineup()`:
1. Query Room — return if non-empty (cache hit)
2. Open `assets/<festival-id>/lineup.json`, parse, seed Room, return

### Navigation Routes

| Route | Screen | Bottom nav visible |
|---|---|---|
| `splash` | SplashScreen | no |
| `festival_select` | FestivalSelectionScreen (first launch) | no |
| `festival_switch` | FestivalSelectionScreen (switch) | no |
| `home` | HomeScreen | yes |
| `discover` | DiscoverScreen | yes |
| `schedule` | ScheduleScreen | yes |
| `map` | MapScreen | yes |
| `tools` | ToolsScreen | yes |
| `artist/{id}` | ArtistDetailScreen | no |
| `guide`, `vibe_quiz`, `vibe_results`, `food`, `packing_list`, `notes_journal`, `budget_tracker`, `speed_discovery`, `genre_breakdown`, `vibe_radar`, `squad_link` | various | no |

Bottom nav items are filtered by `FestivalFeatures` flags (e.g. `timetable: true` required for Schedule).

ViewModels use **manual `ViewModelProvider.Factory`** — Hilt is not used.

### Theme

`OpenFestivalHubTheme` in `Theme.kt` reads `FestivalConfig.current.theme.androidPrimaryLong/AccentLong/SecondaryLong` to build the Material 3 color scheme. Must be called after `FestivalConfig.initialize()`.

### Haptics

Every interactive element must use `rememberHapticManager()` — `haptic.lightTap()`, `mediumTap()`, or `longPress()`. This is enforced as a hard convention.

---

## Data Pipeline

```
festivals/<id>/data/*.json          ← source of truth (hand-authored or scraped)
  → scripts/sync-data.mjs
  → public/data/<id>/               ← web runtime fetch
  → android/app/src/main/assets/<id>/ ← bundled into APK
```

Sync commands (run from repo root):

```bash
npm run lineup:sync                      # sync without re-scraping
npm run lineup:update:sziget             # scrape + clean + sync
npm run lineup:update:rock-am-ring       # sync only (timetable is hand-authored from PDF)
```

---

## Hard Constraints

| Constraint | Why |
|---|---|
| No accounts / auth | 100% anonymous — privacy mandate |
| No social features | No moderation liability |
| No camera / AR / QR | Out of scope, permanently |
| No data collection | All user data stays device-local |
| No API routes | `output: 'export'` — any `route.ts` breaks the build |
| No Spotify OAuth | Spotify revoked API access; removed entirely |
| No Firebase | Removed; no dependency anywhere |
| No server-side AI | Android uses on-device Gemini Nano (ML Kit Prompt API) only |
| Offline first | Map, Lineup, Guide work with zero signal |
| Config-first | No hardcoded festival name/color/date/coords in components |
| Hotlink images only | Never download or host artist images |

---

## Commands Quick-Reference

```bash
# Web (from repo root)
npm run dev             # dev server
npm run typecheck       # TypeScript — must pass before commit
npm run lint            # ESLint — must pass before commit
npm test -- --run       # 190 unit tests — must stay green
npm run build           # static export → out/

# Android (from android/)
./gradlew assembleDebug  # build single APK
./gradlew test           # unit tests

# Deploy
git push main  # → GitHub Actions → GitHub Pages (automatic)
```
