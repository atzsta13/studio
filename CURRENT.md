# CURRENT.md — Repository State Snapshot

**For:** Any LLM or agent joining this workspace cold.
**Read this before touching any file.** It reflects the actual, verified state of the codebase as of April 2026.

---

## 1. What This Project Is

A **white-label, multi-festival platform** that ships a single codebase as separate apps for Sziget, Nova Rock, Frequency, Area 53, and Ernte Punk.

Two parallel codebases live in the same repo:

| Layer | Stack | Root Path |
|---|---|---|
| Web (Hub) | Next.js 16, React 19 App Router, TypeScript strict | `/src/` |
| Android | Jetpack Compose, Kotlin 2.0.21, MVVM, Room v2 | `/android/` |
| Data Pipeline | Node.js ESM scripts | `/scripts/` |

**The cardinal rule:** Never hardcode brand names, colors, dates, or coordinates. Always derive them from config.

---

## 2. Actual Architecture — Web

**Routing:** `src/app/[festivalId]/` — every page is festival-aware via the URL segment.

**Config entry point:** `src/config/festival-engine.ts` (re-exported via `src/config/festival.ts`). Import as `@/config/festival`.

**Context:** `InsiderProvider` (`src/components/layout/insider-provider.tsx`) wraps every festival layout. Consume it with `useInsider()`. This replaced the old `useFestivalData` and `useFavorites` hooks — those no longer exist.

**Layout shell:** `src/app/[festivalId]/layout.tsx` composes `InsiderProvider` → `ErrorBoundary` → `Header` → `OfflineBanner` → `{children}` → `BottomNav`.

**UI stack:**
- Atomic / primitive components: ShadCN (Radix) in `src/components/ui/`
- Complex layouts: MUI 6, themed via `MuiRegistry` (`src/components/layout/mui-registry.tsx`) which reads `FESTIVAL.theme.*`
- Styling: Tailwind CSS variables — never set MUI colors directly

**Key hooks in `src/hooks/`:**
- `use-festival-storage.ts` — `localStorage` with `${FESTIVAL.id}` prefix (cross-festival isolation)
- `use-lineup-diff.ts` — compares current vs. prior year lineup
- `use-vibe-quiz.ts` — quiz state and scoring logic
- `use-clash-resolver.ts` — schedule overlap detection
- `use-translation.ts` — i18n

**AI:** Genkit + Gemini 2.5 Flash. Flow at `src/ai/flows/recommend-artists-flow.ts`. Requires `GOOGLE_GENAI_API_KEY`.

---

## 3. Actual Architecture — Android

**Package:** `com.example.szigerinsider2026`

**Build flavors** (each produces a separate APK):

| Flavor ID | App |
|---|---|
| `sziget` | Sziget Insider |
| `area53` | Area 53 |
| `novarock` | Nova Rock |
| `frequency` | Frequency |
| `erntepunk` | Ernte Punk |

Flavor config is in `android/app/build.gradle.kts`. Runtime switching via `FestivalConfig.kt` + `BuildConfig.FESTIVAL_ID`.

**Repository layer** (`data/repository/`):
- `BaseJsonRepository.kt` — generic JSON-from-assets parser; all data repos extend this
- `FoodRepository`, `POIRepository`, `GuideRepository` — extend `BaseJsonRepository<T>`
- `LineupRepository`, `SpotifyRepository`, `AiRecommendationRepository`, `WeatherRepository`, `LocalScoutRepository`, `AcousticRepository` — specialized

**Database:** Room v2, two entities: `UserProgress` (singleton id=1) and `FavoriteArtist`. Always increment `@Database(version = …)` on entity changes. `fallbackToDestructiveMigration()` is set.

**DI:** No Hilt. Manual `ViewModelProvider.Factory` pattern everywhere.

**UI screens** (`ui/`): `home`, `discover`, `artist`, `map`, `quiz`, `schedule`, `food`, `tools`, `packing`, `splash`, `navigation`, `theme`, `components`, `utils`, `widget`.

**Critical Android rules:**
- Haptics on every interactive element via `rememberHapticManager()`
- Bottom nav hides on scroll-down via `onScrollStateChanged` callback
- Bottom nav absent on: splash, artist detail, schedule, guide, vibe_quiz, vibe_results, highlights, food, packing_list
- Global crash handler in `MainActivity.onCreate` restarts app on uncaught exception

---

## 4. Data Pipeline

**Source of truth:** `festivals/<festival-id>/data/*.json`

**Sync commands:**
```bash
npm run lineup:sync        # all festivals → public/data/ and src/data/
npm run android:sync:sziget  # → android assets
```

`scripts/utils/festival-env.mjs` is the shared utility for resolving festival paths — added in Phase 2. All scripts use it.

**Important:** `stage`, `startTime`, and `endTime` are always `null` in lineup JSON (schedule TBA). Do not build UI that assumes they are populated.

---

## 5. What Phase 2 Completed (Verified in Code)

| Change | Where to confirm |
|---|---|
| `useFestivalData` and `useFavorites` removed, replaced by `useInsider()` | `src/components/layout/insider-provider.tsx` |
| `BaseJsonRepository<T>` abstracts all JSON parsing | `android/.../data/repository/BaseJsonRepository.kt` |
| `festival-env.mjs` centralizes script pathing | `scripts/utils/festival-env.mjs` |

---

## 6. What Phase 3 Has (Already in Codebase)

Phase 3 agent tasks have been partially implemented. The following already exist:

- **Android Vibe Quiz:** `ui/quiz/VibeQuizScreen.kt`, `VibeQuizViewModel.kt`, `VibeResultScreen.kt`
- **Web Vibe Quiz page:** `src/app/[festivalId]/vibe-quiz/page.tsx`
- **Web Lineup Diff hook:** `src/hooks/use-lineup-diff.ts`

Before implementing any Phase 3 task, grep for it first — it may already exist.

---

## 7. Verification Commands

Run these to confirm the codebase is healthy before and after your changes:

```bash
# Web — must pass with zero errors
npm run typecheck

# Web — full build (catches runtime config issues)
npm run build

# Data pipeline — confirms festival-env.mjs works
npm run lineup:sync

# Android — compile all 5 flavors
cd android && ./gradlew assembleDebug
# Expected: BUILD SUCCESSFUL
```

---

## 8. Open Work (Phase 3 Remaining)

Refer to `docs/phases/PHASE_3_AGENT_MANIFEST.md` for full atomic task specs.

Highest-priority remaining items:
1. **Agent F — Vibe Backfill Script** (`scripts/backfill-vibes.mjs`): Auto-assign vibe tags from genres. Unblocks quiz quality.
2. **Agent C — Country Explorer** (`ui/discover/CountryExplorerSheet.kt`): Filter artists by country of origin.
3. **Agent A — Map Coordinate Fix**: `BoxWithConstraints`-based pin placement in `ui/map/MapScreen.kt`.

Each task in the manifest is scoped to specific files — read it before starting.
