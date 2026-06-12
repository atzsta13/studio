# Festival Insider — LLM Briefing

> Read this first. It tells you what the project is, what's working, what's broken, and where the real code lives. Written for a model joining cold with no prior context.

---

## What this is

A multi-festival, 100% offline-first companion app. One website, one Android APK — both covering 6 Austrian/German festivals in 2026.

**No backend. No auth. No accounts. No social. No tracking.**

Everything runs from static JSON bundled in the app or served from GitHub Pages.

**Web**: Next.js 16 static export → GitHub Pages at `https://atzsta13.github.io/studio/`
**Android**: Single APK (`com.example.festivalinsider`), all festival data bundled

---

## Read these docs in order

1. `docs/architecture/ARCHITECTURE.md` — the full technical reference (repo layout, routing, data flow, Android lifecycle, all hard constraints). Start here.
2. `docs/STATUS.md` — what's working, what's broken, what data each festival has right now.
3. `docs/GOALS.md` — the *why* behind every feature. Read before adding anything.
4. `docs/features/FEATURES.md` — feature matrix (Web ✅/⏳, Android ✅/⏳).
5. `AGENTS.md` (repo root) — commands, constraints, and coding standards in condensed form.

---

## Festivals at a glance

| ID | Name | Artists | Timetable | Notes |
|---|---|---|---|---|
| `sziget-2026` | Sziget | 339 | ❌ TBA | 292/339 have stage assigned, no times yet |
| `novarock-2026` | Nova Rock | 89 | ✅ 84/89 | **Currently happening** (Jun 11–14). 5 likely cancelled. |
| `rock-am-ring-2026` | Rock am Ring | 73 | ✅ 73/73 | Finished (Jun 5–7). Full ISO timestamps. |
| `area53-2026` | Area 53 | 30 | ⚠️ 30/30 | Times in wrong format (`"22:30"` not ISO 8601) |
| `frequency-2026` | Frequency | 95 | ❌ TBA | |
| `ernte-punk-2026` | Ernte Punk | 17 | ❌ TBA | |

---

## Actual state of the code (as of 2026-06-12)

### Web
- TypeScript: **0 errors** in app code. `chart.tsx` has 4 pre-existing ShadCN/recharts type errors — known, safe to ignore.
- Tests: **189 passing** (Vitest + React Testing Library).
- The `[festivalId]` URL pattern is kept for deep linking. A `FestivalSwitcher` dropdown in the header lets users switch festivals without going to the hub.
- `BASE_PATH` is critical for GitHub Pages — all `fetch()` calls for JSON must use it (`import { BASE_PATH } from '@/lib/base-path'`).

### Android
- Kotlin: **0 compile errors**.
- Unit tests: **passing**.
- Single APK — no product flavors. `applicationId = "com.example.festivalinsider"`.
- Festival assets live in `src/main/assets/<festival-id>/` (config.json, lineup.json, etc.).
- `FestivalConfig.initialize(context)` must be called in `MainActivity.onCreate()` before `setContent {}`.
- First launch → `FestivalSelectionScreen`. Subsequent launches → `HomeScreen`.
- Festival switching calls `FestivalConfig.switchFestival(context, id)` which saves to SharedPreferences and **restarts the app**.

---

## The rules that cannot be broken

These are architectural decisions, not preferences:

- **No API routes** — `output: 'export'` means any `route.ts` file breaks the build.
- **No hardcoded festival data** — always read from `getFestivalConfig(festivalId)` (web) or `FestivalConfig.current` (Android).
- **No downloaded images** — always hotlink to source CDN, always use `ArtistImage` component which adds attribution.
- **No Spotify** — removed entirely. Do not add OAuth flows.
- **No Firebase** — removed entirely.
- **Offline first** — every feature must work in airplane mode.
- **Config first** — festival name, colors, dates, coordinates come from `config.json`, never hardcoded.

---

## Known issues worth fixing

**High priority:**
- Area 53 time format — `startTime`/`endTime` are `"HH:MM"` strings, not ISO 8601. Timetable, clash resolver, and set countdowns all break for Area 53. Fix: run a migration script converting them to `"2026-07-10T22:30:00+02:00"` format.

**Medium priority:**
- No service worker update prompt — users on PWA get stale data silently after a deploy.
- Sziget timetable — 339 artists waiting for schedule data. When published, run `npm run lineup:update:sziget`.
- Frequency + Ernte Punk timetables — same.

**Low priority:**
- SharedPreferences unencrypted — festival selection ID stored in plain SharedPreferences. For production, migrate to `EncryptedSharedPreferences`.

---

## Key files to know

### Web
| File | What it does |
|---|---|
| `src/config/festival-engine.ts` | All festival configs, `getFestivalConfig()` |
| `src/app/[festivalId]/layout.tsx` | Per-festival layout, CSS var injection, `generateStaticParams()` |
| `src/components/layout/insider-provider.tsx` | Loads lineup JSON, `useInsider()` hook |
| `src/components/layout/header.tsx` | Sticky header + `FestivalSwitcher` |
| `src/components/layout/festival-switcher.tsx` | Festival dropdown |
| `src/lib/base-path.ts` | `BASE_PATH` for GitHub Pages fetches |
| `next.config.ts` | `output: 'export'`, `basePath: '/studio'` |

### Android
| File | What it does |
|---|---|
| `data/config/FestivalConfig.kt` | Config loader, SharedPreferences selection, `switchFestival()` |
| `data/local/AppDatabase.kt` | Room singleton, `resetInstance()` |
| `data/repository/LineupRepository.kt` | Loads `<id>/lineup.json`, seeds Room |
| `ui/navigation/Navigation.kt` | All routes + bottom nav |
| `ui/splash/SplashScreen.kt` | First screen, routes to home or festival_select |
| `ui/splash/FestivalSelectionScreen.kt` | Festival picker |
| `MainActivity.kt` | Entry point, must call `FestivalConfig.initialize()` |
| `ui/theme/Theme.kt` | Material 3 theme from `FestivalConfig.current.theme` |

### Data
| Path | What it is |
|---|---|
| `festivals/<id>/config.json` | Source of truth for festival config |
| `festivals/<id>/data/lineup.json` | Source of truth for artist data |
| `public/data/<id>/` | Web runtime (synced from festivals/) |
| `android/app/src/main/assets/<id>/` | Android runtime (synced from festivals/) |

---

## Commands

```bash
# Web
npm run dev             # dev server (localhost:3000)
npm run typecheck       # TypeScript check
npm run lint            # ESLint
npm test -- --run       # 189 unit tests
npm run build           # static export → out/
npm run lineup:sync     # sync all festival data to public/ and android assets

# Android (run from android/)
./gradlew assembleDebug                           # build APK
./gradlew compileDebugKotlin                      # fast Kotlin-only check
./gradlew test                                    # unit tests
adb install -r app/build/outputs/apk/debug/app-debug.apk  # install to device
```
