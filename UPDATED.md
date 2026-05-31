# UPDATED.md — Platform Snapshot

**Date:** 2026-05-31
**Purpose:** Canonical current-state reference for any AI agent picking up this repo cold.
Read this alongside `AGENTS.md` (architecture rules) and `CURRENT.md` (feature status).

---

## Build Toolchain (as of 2026-05-31)

### Web
| Tool | Version |
|------|---------|
| Next.js | 16.1.6 |
| React | 19.0.0 |
| TypeScript | strict mode, 0 errors |
| ESLint | flat config (`eslint.config.mjs`) |
| Vitest + RTL | 189 passing |

### Android
| Tool | Version | Notes |
|------|---------|-------|
| Kotlin | **2.3.20** | Latest stable (Jun 2026) |
| AGP | **9.2.0** | Breaking change from 8.x — `kotlinOptions {}` removed |
| Gradle | **9.5.1** | Updated from 8.13 |
| KSP | **2.3.9** | New standalone versioning (no longer `{kotlin}-{minor}` prefix) |
| Java toolchain | **21** | `kotlin { compilerOptions { JvmTarget.JVM_21 } }` |
| compileSdk / targetSdk | **36** | Android 16 — required by Play Store since May 31 2026 |
| Compose BOM | **2026.05.00** | May 2026 BOM |
| Room | **2.8.4** | |
| Lifecycle | **2.10.0** | |
| Navigation Compose | **2.9.0** | |
| Coil | **3.4.0** | Migrated from Coil 2 — group `io.coil-kt.coil3`, package `coil3.compose` |
| AppCompat | **1.7.1** | |
| Material | **1.13.0** | |

### AGP 9.x Migration Notes
The `kotlinOptions {}` DSL inside `android {}` is removed in AGP 9.x. This project uses the replacement:
```kotlin
// top-level in app/build.gradle.kts
kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21
    }
}
```
AGP 9.x also ships built-in Kotlin support — the explicit `alias(libs.plugins.kotlin.android)` is technically redundant but kept for clarity.

---

## Festivals

| ID | Name | Artists | Schedule |
|----|------|---------|----------|
| `sziget-2026` | Sziget | ~339 | TBA — all `stage`/`startTime`/`endTime` null |
| `novarock-2026` | Nova Rock | ~89 | TBA |
| `frequency-2026` | Frequency | ~95 | TBA |
| `area53-2026` | Area 53 | ~30 | TBA |
| `ernte-punk-2026` | Ernte Punk | ~17 | TBA |
| `rock-am-ring-2026` | Rock am Ring | 73 | **Full timetable** (Jun 5–7 2026, 3 stages) |

Rock am Ring stores times in `+02:00` (CEST). The timetable uses `utcOffsetHours: 2` (set in `festivals/rock-am-ring-2026/config.json`) to convert UTC to display labels.

---

## Recent Changes (this session)

### Android Toolchain Upgrade
- Kotlin 2.0.21 → **2.3.20**, AGP 8.13.2 → **9.2.0**, Gradle 8.13 → **9.5.1**
- KSP versioning scheme changed: `2.0.21-1.0.27` → standalone `2.3.9`
- compileSdk/targetSdk 35 → **36** (Play Store compliance)
- Java 17 → **21** toolchain; migrated `kotlinOptions {}` to `kotlin { compilerOptions {} }`
- Compose BOM `2024.04.01` → **2026.05.00**

### Coil 2 → 3 Migration
- Dependency: `io.coil-kt:coil-compose` → `io.coil-kt.coil3:coil-compose`
- Imports in all 7 source files: `coil.compose.AsyncImage` → `coil3.compose.AsyncImage`
  - `ArtistCard.kt`, `ArtistDetailScreen.kt`, `HomeScreen.kt`, `LineupDiffSheet.kt`,
    `ScheduleScreen.kt`, `SerendipityScreen.kt`, `SpeedDiscoveryScreen.kt`

### Web Performance Fixes
- `ArtistImage` component: added `loading="lazy" decoding="async"` — prevents 300+ simultaneous fetches on discover grid
- `InsiderProvider`: memoized derived Sets (`favorites`, `mustSeeIds`, `interestedIds`) and the full context value — eliminates re-renders of all `useInsider()` consumers on unrelated state changes
- `next.config.ts`: added `experimental.optimizePackageImports` for `@mui/material`, `@mui/icons-material`, `lucide-react`, `react-icons` — enables tree-shaking

### Data Enrichment
- Artist images enriched via two-step iTunes API (artistId → album artwork) for ernte-punk, novarock, frequency, rock-am-ring
- Country codes enriched via MusicBrainz API (rate-limited 1 req/s)
- Result: near 100% image coverage across all festivals

### Code Audit
- Deleted `src/scripts/` (3 orphan LLM-generated files: wrong directory, used `require()`, dead paths)
- ESLint flat config wired and passing: 0 warnings, 0 errors
- `global-search.tsx`: removed unused import (`Music2`)

---

## Architecture Quick-Reference

### Web Data Flow
```
festivals/<id>/data/*.json
  → npm run lineup:sync
  → public/data/<id>/          (fetched at runtime via useInsider)
  → src/data/                  (legacy import path)
  → android/app/src/<flavor>/assets/
```

All client-side `fetch()` calls use `BASE_PATH` from `@/lib/base-path`:
```ts
fetch(`${BASE_PATH}/data/${festivalId}/lineup.json`)
```
`BASE_PATH = '/studio'` in production (GitHub Pages), `''` locally.

### Android Product Flavors
Six flavors: `sziget`, `novarock`, `frequency`, `area53`, `erntepunk`, `rockamring`.
Each has its own `applicationId`, per-flavor assets in `src/<flavor>/assets/`.

### Key Files
| File | Purpose |
|------|---------|
| `src/config/festival-engine.ts` | `FestivalConfig` interface + all festival registrations |
| `src/components/layout/insider-provider.tsx` | Central state: lineup, favorites, battery-saver |
| `src/components/ui/artist-image.tsx` | Always use this for artist images — hotlinks CDN with attribution |
| `src/lib/base-path.ts` | `BASE_PATH` constant for static export fetch paths |
| `android/gradle/libs.versions.toml` | Single source of truth for all Android versions |
| `android/app/build.gradle.kts` | AGP 9.x build config, all 6 flavors |
| `scripts/enrich-lineup.mjs` | iTunes + MusicBrainz API enrichment pipeline |

---

## Integrity Checks

```bash
# Web
npm run typecheck        # 0 errors
npm run lint             # 0 errors
npm test -- --run        # 189/189 passing

# After any data change
npm run lineup:sync

# Android (pick any flavor)
cd android
./gradlew testSzigetDebugUnitTest    # 60/60 passing
./gradlew assembleSzigetDebug        # verify build
```

---

## Hard Constraints (do not violate)

- **No API routes** — `output: 'export'` static build. Any `route.ts` breaks the build.
- **No Spotify** — API access revoked for new apps. No OAuth, no match endpoints.
- **No accounts / no social / no camera** — hard mandates, see `docs/guides/MANDATES.md`.
- **Config-first** — never hardcode festival names, colors, coordinates in components. Use `FESTIVAL` from `@/config/festival-engine` (web) or `FestivalConfig` (Android).
- **Images** — never download/host artist images. Always hotlink CDN. Always use `ArtistImage` component (web) for attribution.
- **BASE_PATH** — every web `fetch()` for `/data/` must be prefixed with `BASE_PATH`.

---

## Open Items

| Item | Status |
|------|--------|
| Timetable for Sziget/NovaRock/Frequency/Area53/ErntePunk | Blocked — awaiting schedule publication |
| Android a11y audit (contentDescription) | Deferred |
| Coil 3 `SubcomposeAsyncImage` API if needed | Check Coil 3 migration guide |
| `newsBulletin`, `afterMovie` Android screens | Feature-flagged but not implemented |
| Android EncryptedSharedPreferences | MVP-accepted; fix before production release |

---

*Web: TypeScript ✅ · Lint ✅ · Tests 189/189 ✅*
*Android: Kotlin 2.3.20 · AGP 9.2.0 · Gradle 9.5.1 · compileSdk 36*
