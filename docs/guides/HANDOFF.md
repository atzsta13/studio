# Sziget Insider 2026 — Agent Handoff

Full context dump for a new agent picking up this codebase cold.
Last updated: May 2026.

---

## What this project is

Two standalone apps sharing one data source:

| Platform | Stack | Root |
|----------|-------|------|
| Web | Next.js 16, React 19, Tailwind CSS v4, Genkit AI | `/` (repo root) |
| Android | Jetpack Compose, Kotlin 2.0.21, Room, MVVM | `android/` |

Both read from `src/data/lineup.json` (and `public/data/` at runtime) — 240+ Sziget 2026 artists (Scraped & Cleaned). The Android app bundles it as `android/app/src/[flavor]/assets/lineup.json`. When lineup data changes, edit the source in `festivals/[id]/data/` and run `npm run lineup:sync`.

**Critical data constraint:** `startTime`, `endTime` are `null` for most artists. Sziget hasn't published full schedule data. Do not build any UI that assumes these exist. `day` and `stage` are now partially populated from official site tags. `vibes` is 100% populated via AI backfill.

---

## Repo structure (top level)

```
/
├── festivals/                  # Source of truth for config and data
├── src/                        # Next.js web app
│   ├── app/                    # App Router pages + API routes
│   ├── components/             # React components
│   ├── data/                   # Synced data files
│   ├── ai/                     # Genkit AI flows
│   ├── hooks/                  # Client hooks (favorites, etc.)
│   └── types/index.ts          # LineupItem, MapPin interfaces
├── public/
│   ├── sw.js                   # PWA service worker
│   └── data/                   # White-label runtime data
├── android/                    # Android app (fully self-contained)
├── docs/                       # Architecture, features, UI guide
├── CLAUDE.md                   # Agent instructions (read this first)
├── FEATURES.md                 # ~165 feature backlog, S→D tier ranking
└── docs/features/FEATURES.md   # Honest build status (✅/⏳/❌)
```

---

## Web — current state

### Routes
| Route | Notes |
|-------|-------|
| `/` | Hub Home — Global Search, Global Matchmaker, Lineup Diff |
| `/[festivalId]` | Festival Home — headliners, mood feed |
| `/discover` | Artist grid, all filters, Country Explorer, Serendipity modal, AI Scout, Vibe DNA Quiz entry |
| `/artist/[id]` | Static. Spotify iframe embed ("Island Listen"), similar artists |
| `/map` | POI map — stages, food, water/toilets/first-aid |
| `/timetable` | Schedule grid — ⏳ no time data yet |
| `/food` | Food vendor list with dietary filters |
| `/tools` | HUF converter, live weather, SOS beacon, Survival Guide, Car Finder, Tent Finder |
| `/vibe-quiz` | 5-step genre/mood quiz → ranked artist results with save-all FAB |

---

## Android — current state

### Architecture
MVVM, no Hilt. Manual `ViewModelProvider.Factory` everywhere. Room for user state only — artist/POI/food data is bundled JSON.

```
Package: com.example.szigerinsider2026
compileSdk: 35 | minSdk: 26 | Kotlin: 2.0.21
Room DB: version 8
```

### Navigation — all routes
| Route | Screen | Bottom bar? | Entry point |
|-------|--------|-------------|-------------|
| `splash` | SplashScreen | No | App launch |
| `home` | HomeScreen | Yes | Bottom nav |
| `discover` | DiscoverScreen | Yes | Bottom nav |
| `map` | MapScreen | Yes | Bottom nav |
| `tools` | ToolsScreen | Yes | Bottom nav |
| `schedule` | ScheduleScreen | No | HomeScreen card |
| `artist/{artistId}` | ArtistDetailScreen | No | Discover / Home / similar artists |
| `vibe_quiz` | VibeQuizScreen | No | Discover |
| `vibe_results` | VibeResultScreen | No | After quiz |
| `guide` | SurvivalGuideScreen | No | Tools screen card |
| `food` | FoodScreen | No | Map → FOOD chip → "SEE ALL VENDORS →" |

### Room DB schema (version 8)
**`favorite_artists` table**
| Column | Type |
|--------|------|
| `artistId` | String (PK) |
| `timestamp` | Long |
| `tier` | String ("must_see" | "interested") |

`fallbackToDestructiveMigration()` is set — bump `@Database(version = N)` for any schema change. Current version: **8**.

---

## Commands

**Web** (from repo root):
```bash
npm run dev          # port 9002
npm run build
npm run typecheck    # pre-flight check before committing
npm run lineup:sync  # moves data from festivals/ to public/data and src/data
```

**Android** (from `android/`):
```bash
./gradlew assembleSzigetDebug  # Build Sziget variant
./gradlew assembleDebug        # Build ALL variants
```

---

## Platform integrity (as of May 2026)

| Check | Status |
|-------|--------|
| `npm run typecheck` | ✅ 0 errors |
| `npm test -- --run` | ✅ 198/198 passing |
| White-label compliance | ✅ No hardcoded hex colors in components |
| Vibe coverage | ✅ 100% (239 artists) |
| Android Room version | v8 |

---

## Docs map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent instructions, commands, architecture summary — read first |
| `android/README.md` | Full Android file tree, routes, Room schema, patterns, design system |
| `docs/architecture/ARCHITECTURE.md` | Dual-platform architecture, data schema, API routes, what's NOT here |
| `docs/features/FEATURES.md` | Current build status table (✅/⏳/❌) per feature per platform |
| `docs/guides/UI_GUIDE.md` | Color tokens, typography rules, haptic patterns, new-screen checklists |
| `docs/phases/PHASE_3_AGENT_MANIFEST.md` | Phase 3 plan — ✅ complete (Vibe Quiz, Serendipity, Country Explorer, Survival Guide, Map fix, Vibe backfill) |
| `FEATURES.md` | Full ~165 feature backlog ranked S→D tier |
| `docs/guides/HANDOFF.md` | This file |
