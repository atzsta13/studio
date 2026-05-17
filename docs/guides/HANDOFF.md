# Sziget Insider 2026 — Agent Handoff

Full context dump for a new agent picking up this codebase cold.
Last updated: May 17, 2026.

---

## What this project is

Two standalone apps sharing one data source:

| Platform | Stack | Root |
|----------|-------|------|
| Web | Next.js 16, React 19, Tailwind CSS v4, Genkit AI | `/` (repo root) |
| Android | Jetpack Compose, Kotlin 2.0.21, Room v8, MVVM | `android/` |

**Festivals:** Sziget (239 artists), Nova Rock (84), Frequency (59), Area 53 (30). All with 100% vibe coverage.

**Critical data constraint:** `startTime` and `endTime` are `null` for all artists — Sziget has not published the 2026 schedule. Do not build any UI that assumes they exist. `day` and `stage` are partially populated. `vibes` is 100% populated.

---

## Repo structure

```
/
├── festivals/                  # Source of truth — edit here, then npm run lineup:sync
│   └── <id>/
│       ├── config.json         # Theme, features (55 flags), dates, currency, aiPersona
│       └── data/               # lineup.json, poi.json, food.json, survival.json
├── src/                        # Next.js web app
│   ├── app/                    # App Router pages + API routes
│   ├── components/             # React components (ui/brutalist/ for NeonButton, GlassCard)
│   ├── hooks/                  # Client hooks — favorites, vibe quiz, hydration, etc.
│   ├── ai/flows/               # Genkit AI flows (recommend-artists-flow.ts)
│   └── types/index.ts          # LineupItem, GenreOption, etc.
├── public/
│   ├── sw.js                   # PWA service worker (cache v4, SKIP_WAITING support)
│   └── data/                   # Runtime data synced from festivals/ (all 4 festivals)
├── android/                    # Fully self-contained Android app
├── scripts/                    # Data pipeline (sync, backfill-vibes, validate-configs)
├── docs/                       # All docs — architecture, features, guides, phases
└── CLAUDE.md                   # Agent instructions — read first
```

---

## Web — current state

### Routes (all under `/[festivalId]/`)
| Route | Notes |
|-------|-------|
| `/` | Hub — Global Search, Global Vibe Scout, festival radar |
| `/[festivalId]` | Festival Home — headliners, countdown, mood feed, lineup diff |
| `/[festivalId]/discover` | Artist grid, 4 filter rows, Country Explorer bottom sheet, Serendipity modal, AI Scout panel, Genre DNA entry |
| `/[festivalId]/artist/[id]` | Hero image, Spotify WebView embed, socials, similar artists |
| `/[festivalId]/map` | POI dot map — stages, water, toilets, first-aid; hydration mode with pulse animation |
| `/[festivalId]/timetable` | ⏳ Placeholder — awaiting schedule data |
| `/[festivalId]/food` | Vendor list with dietary filters |
| `/[festivalId]/tools` | HUF converter, weather, SOS beacon, Car Finder, Tent Finder |
| `/[festivalId]/tools/dictionary` | Festival slang glossary |
| `/[festivalId]/tools/shuttle` | Shuttle timetable |
| `/[festivalId]/vibe-quiz` | 5-step genre/mood quiz → ranked artist results + save-all FAB |
| `/[festivalId]/guide` | Survival guide with camping, transport, health, emergency sections |
| `/[festivalId]/highlights` | Year highlights reel |
| `/[festivalId]/merch` | Merch catalog |
| `/[festivalId]/packing-list` | Packing list |
| `/[festivalId]/discover/speed` | Speed discovery (swipe cards) |
| `/search` | Cross-festival artist search |

### Key web patterns
- `FESTIVAL` imported from `@/config/festival-engine` — never hardcode names/colors
- `localStorage` keys prefixed with `${FESTIVAL.id}` — cross-festival isolation
- `isMounted` pattern or `suppressHydrationWarning` for browser-only values
- AI flow: `src/ai/flows/recommend-artists-flow.ts` — injects full lineup + stages + prices, no truncation

---

## Android — current state

### Core facts
```
Package:    com.example.szigerinsider2026
compileSdk: 35 | minSdk: 26 | Kotlin: 2.0.21
Room DB:    version 8 — fallbackToDestructiveMigration() set
            bump @Database(version = N) for any entity change
```

### All navigation routes
| Route | Screen | Bottom bar? | Entry |
|-------|--------|-------------|-------|
| `splash` | SplashScreen | No | App launch |
| `home` | HomeScreen | Yes | Bottom nav |
| `discover` | DiscoverScreen | Yes | Bottom nav |
| `map` | MapScreen | Yes | Bottom nav |
| `tools` | ToolsScreen | Yes | Bottom nav |
| `schedule` | ScheduleScreen | No | HomeScreen quick nav |
| `guide` | SurvivalGuideScreen | No | ToolsScreen card |
| `artist/{id}` | ArtistDetailScreen | No | Discover / Home / similar |
| `vibe_quiz` | VibeQuizScreen | No | Discover DNA button |
| `vibe_results` | VibeResultScreen | No | After quiz completion |
| `food` | FoodScreen | No | Map FOOD chip |
| `packing_list` | PackingListScreen | No | ToolsScreen card |
| `notes_journal` | NotesJournalScreen | No | ToolsScreen card |
| `budget_tracker` | BudgetTrackerScreen | No | ToolsScreen card |
| `genre_breakdown` | GenreBreakdownScreen | No | DiscoverScreen bar-chart icon |
| `vibe_radar` | VibeRadarScreen | No | DiscoverScreen bubble-chart icon |
| `friend_finder` | FriendFinderScreen | No | ToolsScreen card |
| `speed_discovery` | SpeedDiscoveryScreen | No | DiscoverScreen |

### Repository interface
`ILineupRepository` — implemented by `LineupRepository`. Use the interface in ViewModels for testability. `DiscoverViewModel` and `VibeQuizViewModel` already use it and have unit tests.

### Key Android patterns
- **No Hilt** — manual `ViewModelProvider.Factory` everywhere
- **Offline-first** — all data bundled as assets; only network: artist images (Coil) + weather (Open-Meteo)
- **Haptics required** — `rememberHapticManager()` on every interactive element
- **SharedPreferences** for lightweight persistence (budget, notes, friend codes, tent location)
- **Room** only for favorites (`favorite_artists` table: artistId PK, timestamp, tier)

---

## Platform integrity (May 17, 2026)

| Check | Status |
|-------|--------|
| `npm run typecheck` | ✅ 0 errors |
| `npm test -- --run` | ✅ 198/198 passing |
| White-label compliance | ✅ No hardcoded hex in components |
| Vibe coverage | ✅ 100% (all 4 festivals) |
| Android ILineupRepository | ✅ DiscoverViewModel + VibeQuizViewModel tested |
| PWA update banner | ✅ SW update prompt live |
| AI 128k RAG | ✅ Full bios + stages + prices in prompt |

---

## What is blocked (do not build yet)

| Feature | Blocked by |
|---------|-----------|
| Timetable, ClashDetector, setCountdowns, groupSchedules, stageCapacity | `startTime`/`endTime` null — awaiting Sziget 2026 schedule |
| secretStages | Unannounced location data |
| Tactical Vision AI (Phase 6) | NO CAMERA mandate in `docs/guides/MANDATES.md` |

---

## Commands

```bash
# Web
npm run dev                                          # dev server, port 9002
npm run typecheck                                    # run before every commit
npm test -- --run                                    # full test suite
npm run lineup:sync                                  # sync festivals/ → public/data/ + src/data/
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run dev   # test other festival

# Android (from android/)
./gradlew assembleSzigetDebug    # build Sziget flavor
./gradlew assembleDebug          # build all flavors
./gradlew test                   # unit tests
```

---

## Docs map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent rules, commands, architecture — read first |
| `CURRENT.md` | Real-time state snapshot with all routes, open items, integrity checks |
| `android/README.md` | Full Android file tree, Room schema, design system |
| `docs/features/FEATURES.md` | Build status per feature per platform |
| `docs/guides/KNOWN_ISSUES.md` | All known issues with severity + status |
| `docs/guides/MANDATES.md` | Hard constraints — no camera, no data collection, offline-first |
| `docs/TESTING.md` | Full test file table, mock patterns, what's not tested |
| `docs/phases/PHASE_3_AGENT_MANIFEST.md` | Phase 3 — ✅ complete |
| `docs/phases/PHASE_5_META_HUB.md` | Phase 5 — ✅ complete |
| `docs/phases/PHASE_6_IMMERSIVE_AI.md` | Phase 6 — partially blocked (see MANDATES) |
