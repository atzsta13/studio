# Sziget Insider 2026 — Phase 3: Discovery, Depth & Delight

## Context & Constraints

Phase 2 delivered a complete, wired Android app: all 5 main screens, Room persistence, reactive ViewModels, haptics, and an animated splash.

**What Phase 3 is NOT:**
- Not a timetable (stage/startTime/endTime are all `null` in the current dataset — Sziget hasn't published this yet)
- Not a food map (the 10 food vendors in `food.json` are placeholders — no real 2026 data yet)
- Not a full clash detector (no time slots = no real conflicts)

**What Phase 3 IS:**
All features in this phase are designed around the data we **actually have**:
- 80 artists with name, country, genre(s), vibe(s) (47.5% coverage), image, description, socials, day (53%), headliner flag
- `lineup_2025.json` (82 artists) for year-over-year comparison
- 8 POIs (water, toilet, first-aid, camping)
- Room DB (UserProgress XP/rank + FavoriteArtist)

When schedule data becomes available, features designed here (My Lineup, Schedule screen) will simply gain a time dimension without a full rewrite.

---

## Current App State

| Screen | Status | Real Data? | Known Issues |
|--------|--------|-----------|--------------|
| Splash | ✅ Complete | — | — |
| Home | ✅ Complete | Headliners from JSON, countdown real | — |
| Discover | ✅ Complete | All 80 artists, 4 filter rows, search | Vibes filter skips 42 artists with no vibes |
| Artist Detail | ✅ Complete | Full JSON data, socials | — |
| Map | ✅ Complete | POI/Food from JSON | **Coordinate scaling broken** (1000dp offset) |
| Passport | ✅ Complete | Room-persisted XP/stamps | Stamps are predefined, no new challenge types |
| Tools | ✅ Complete | Static rates, SOS UI | HUF rate is hardcoded |
| Schedule | ✅ Exists | Day filter from JSON | **No time/stage data** — clash detection is built but inert |

---

## Phase 3 Features

### Feature 1 — Vibe DNA Quiz
**Screen:** New bottom sheet / full-screen modal, accessible from Home ("FIND YOUR SOUND") and Discover header

**What it does:**
A 5-step swipe-or-tap quiz that asks the user about their mood and preferences, then generates a curated shortlist of 4–8 artists from the lineup.

**Steps:**
1. **Energy Level** — `CHILL` / `BALANCED` / `UNHINGED`
2. **Genre World** — pick up to 2 from `ELECTRONIC`, `ROCK`, `HIP-HOP`, `INDIE`, `TECHNO`, `POP`, `METAL`, `EXPERIMENTAL`
3. **Crowd Vibe** — `DANCE FLOOR`, `MOSH PIT`, `FESTIVAL FIELD`, `INTIMATE STAGE`
4. **Mood Tag** — pick one: `EUPHORIC`, `DARK`, `NOSTALGIC`, `FRESH`, `HARD`
5. **Wildcards OK?** — `YES, SURPRISE ME` / `KEEP IT SAFE`

**Matching logic (in ViewModel):**
- Score each artist by: genre overlap (2pts each), vibe overlap (1pt each), headliner bonus (+1 if wildcards off), random noise (+0–1 if wildcards on)
- Return top 8 sorted by score, minimum score > 0
- If fewer than 4 match → relax to top 4 regardless of score

**Output:** `VibeResultScreen` — a dramatic reveal card stack showing matched artists. Tapping any card → Artist Detail. "SAVE AS MY PICKS" → bulk-favorites all results.

**Files to create:**
- `ui/quiz/VibeQuizScreen.kt`
- `ui/quiz/VibeQuizViewModel.kt`
- `ui/quiz/VibeResultScreen.kt`

**Data required:** genres (100% coverage), vibes (47.5% — works fine, unvibe'd artists score lower)

---

### Feature 2 — My Lineup (Personal Day Planner)
**Screen:** New tab inside Schedule screen, or dedicated route `my_lineup`

**What it does:**
Users build their personal festival wishlist organized by day. No times needed — just "I want to see X on Friday". When schedule data arrives, this becomes a real timetable automatically.

**UI:**
- Day tabs: WED / THU / FRI / SAT / SUN / MON / TUE (same as Schedule)
- Each tab shows the user's favorited artists **for that day** in a ranked list (drag to reorder priority)
- Artists without a day assigned appear in an "UNDECIDED" bucket
- A "MUST-SEE" toggle (long press) marks an artist as top priority — shown with a neon border

**"Lineup Card" export:**
- A `Canvas`-drawn shareable image: brutalist grid of artist names grouped by day, with the app logo and user's festival name
- Share via Android share sheet (`Intent.ACTION_SEND`, `image/png`)

**Storage:** Extend `FavoriteArtist` Room entity to add `priority: Int` and `mustSee: Boolean` columns (increment DB version → destructive migration)

**Files to create:**
- `ui/lineup/MyLineupScreen.kt`
- `ui/lineup/MyLineupViewModel.kt`
- `ui/lineup/LineupCardExporter.kt` (Canvas drawing)

**Files to modify:**
- `data/local/AppDatabase.kt` (version bump)
- `data/local/UserDao.kt` (new queries for ordered favorites)
- `ui/navigation/Navigation.kt` (add route)

---

### Feature 3 — "More Like This" on Artist Detail
**Screen:** New section at bottom of `ArtistDetailScreen`

**What it does:**
After the bio/socials section, show a horizontal scroll of 3–5 artists from the lineup that share the most genres or vibes with the current artist.

**Matching logic:**
- For the current artist, count shared genres + shared vibes for every other artist
- Rank by total overlap, take top 5 (min 1 shared tag)
- Show as compact horizontal `ArtistCard` variants — image thumbnail + name + shared-tag count badge

**Implementation:** Add `findSimilar(artist: Artist, all: List<Artist>): List<Artist>` to `DiscoverViewModel` or a new `ArtistSimilarityUtil.kt`.

**Files to modify:**
- `ui/artist/ArtistDetailScreen.kt`
- `ui/discover/ArtistViewModel.kt` (or new util)

---

### Feature 4 — Country Explorer
**Screen:** Modal bottom sheet accessible from Discover header (globe icon)

**What it does:**
Browse the 80-artist lineup by country of origin. Shows a ranked list of countries by number of artists, with flag emoji, country name, and artist count.

Tapping a country → filters Discover to that country (adds a new hidden "country" filter dimension to `DiscoverViewModel`).

**Stats panel at top:**
- Total countries represented: **21**
- Most artists from: {top country}
- Furthest travelled: {most exotic country by geography}

**Country list item:**
```
🇬🇧  UNITED KINGDOM        14 artists  →
🇫🇷  FRANCE                 9 artists  →
🇩🇪  GERMANY                7 artists  →
```

**Files to create:**
- `ui/discover/CountryExplorerSheet.kt`

**Files to modify:**
- `ui/discover/DiscoverViewModel.kt` (add `countryFilter: String?` state + filtering logic)
- `ui/discover/DiscoverScreen.kt` (globe icon in header → triggers sheet)

---

### Feature 5 — 2025 → 2026 Lineup Diff ("What's New")
**Screen:** Section on Home screen ("NEW THIS YEAR") + full-screen modal

**What it does:**
Compares `lineup_2025.json` (82 artists) with `lineup.json` (80 artists) to show:
- **New arrivals**: artists in 2026 not in 2025 (matched by name, normalized)
- **Returning artists**: artists in both years
- **Genre landscape shift**: top genres in 2025 vs 2026 (bar chart or tag cloud)

**Home preview:** A horizontal scroll of 4 "NEW" artist cards (new artists only), with a "SEE ALL CHANGES →" button.

**Full modal:**
- Tab 1: `NEW` — cards for first-time artists
- Tab 2: `RETURNING` — familiar faces
- Tab 3: `VIBE SHIFT` — genre comparison (simple text stats: "More Techno (+3), Less Rock (-2)")

**Files to create:**
- `ui/home/LineupDiffSheet.kt`
- `data/repository/LineupDiffRepository.kt` (loads both JSONs, diffs by normalized name)

**Files to modify:**
- `ui/home/HomeScreen.kt` (add "NEW THIS YEAR" card)
- `data/repository/LineupRepository.kt` (expose `loadPreviousYear()`)

---

### Feature 6 — Enhanced Passport Challenges
**Screen:** New "CHALLENGES" tab inside `PassportScreen`

**What it does:**
The current Passport has stamps (static checklist) and XP. This adds a **dynamic challenge system** with auto-completing challenges based on user behaviour tracked through Room.

**Challenge types:**
| Challenge | XP | Trigger |
|-----------|-----|---------|
| First Favorite | 50 | Favorite any artist |
| Genre Explorer | 75 | Favorite artists from 3 different genres |
| Globe Trotter | 100 | Favorite artists from 5 different countries |
| Headliner Fan | 150 | Favorite all 6 headliners |
| Vibe Curator | 75 | Favorite 3 artists with the same vibe |
| Must-See Committed | 100 | Mark 5 artists as must-see |
| DNA Match | 50 | Complete the Vibe Quiz |
| Discovery Machine | 125 | Favorite an artist from Vibe Quiz results |
| Full Week | 200 | Have at least 1 favorite for every festival day |
| Social Stalker | 75 | Tap a social link on any artist detail |

**Rank ladder** (existing + new tiers):
`CIVILIAN` → `ISLAND SCOUT` → `STAGE HUNTER` → `VIBE ARCHITECT` → `FESTIVAL GOD`

**Implementation:** `ChallengeEngine.kt` — a pure function taking `List<FavoriteArtist>` + `UserProgress` → returns `List<ChallengeStatus>`. Evaluated in `PassportViewModel` every time favorites change. Completing a challenge writes XP delta to Room.

**Files to create:**
- `ui/passport/ChallengeEngine.kt`
- `ui/passport/ChallengeListScreen.kt`

**Files to modify:**
- `ui/passport/PassportScreen.kt` (add CHALLENGES tab)
- `ui/passport/PassportViewModel.kt` (evaluate challenges)
- `data/local/UserProgress.kt` (add `completedChallenges: String` field — JSON list)
- `data/local/AppDatabase.kt` (version bump)

---

### Feature 7 — Serendipity Mode ("Spin the Wheel")
**Screen:** Floating action button on Discover screen

**What it does:**
A single-tap "surprise me" that randomly surfaces one unfavorited artist the user hasn't yet tapped into. Shows as a dramatic full-screen reveal card with a spin animation.

**Logic:**
- Filter `allArtists` → remove all favorited IDs → pick random from remainder
- If all artists are favorited → pick from all (show "YOU'VE SEEN IT ALL" badge)
- Track "already revealed via serendipity" in a local `Set<String>` (session-only, not persisted) to avoid repeats in one session

**UI:** Full-screen composable overlay:
- Spinning ring animation (InfiniteTransition) during "selection"
- After 1.5s: artist card slams in with spring animation
- Big `EXPLORE →` CTA to Artist Detail
- `SPIN AGAIN` secondary button
- Contributes to "Discovery Machine" challenge

**Files to create:**
- `ui/discover/SerendipityScreen.kt`

**Files to modify:**
- `ui/discover/DiscoverScreen.kt` (FAB button)
- `ui/discover/DiscoverViewModel.kt` (expose `getRandomUnfavoritedArtist()`)

---

### Feature 8 — Festival Survival Guide
**Screen:** New section in Tools screen (or separate route `guide`)

**What it does:**
Static but richly formatted content covering practical festival survival. No API needed — content is hardcoded in Kotlin as a structured data class list.

**Sections:**
1. **Getting There** — transport options, shuttle info, address
2. **Money & ATMs** — where ATMs are on island, HUF tips, card acceptance
3. **Staying Safe** — medical tent locations, lost & found, buddy system
4. **Camping** — zones, quiet hours, tent rules, charging stations
5. **Hungarian Phrases** — 10 essential phrases with pronunciation
6. **Festival Rules** — banned items, re-entry policy, wristband rules
7. **Connectivity** — free WiFi zones, signal tips, offline apps to download
8. **Eco Tips** — bring a reusable cup, water refill stations, leave no trace

**UI:** `LazyColumn` with collapsible `ExpansionCard` per section. Brutalist accordion style — tapping header reveals content with slide animation. Each section has a thematic neon icon.

**Hungarian Phrases component:** Tapping any phrase copies it to clipboard + shows a `SnackBar` confirmation + light haptic. Perfect for "KEREk EGY SÖRT" (I'd like a beer).

**Files to create:**
- `ui/tools/SurvivalGuideScreen.kt`
- `data/content/SurvivalGuideContent.kt` (hardcoded content data class)

**Files to modify:**
- `ui/tools/ToolsScreen.kt` (add "SURVIVAL GUIDE" card that navigates to route)
- `ui/navigation/Navigation.kt` (add `guide` route, hide bottom bar)

---

### Feature 9 — Map Coordinate Fix + "Water Station" Highlight Mode
**Screen:** `MapScreen`

**What it does (fix):**
The current map pins use `offset(x = (coord.x / 100 * 1000).dp)` which places dots far off-screen. Fix: use `BoxWithConstraints` to get actual pixel dimensions, then scale coordinates proportionally.

**What it does (feature):**
The existing "Hydration FAB" is a nice idea but currently only filters the list. Enhance it:
- When hydration mode active: all non-water pins dim to 20% opacity, water pins pulse with a cyan glow animation
- Add a "NEAREST WATER" indicator: sort water stations by distance from center, show distance in abstract "steps" (no GPS needed — just relative distance from island center point `50,50`)

**Files to modify:**
- `ui/map/MapScreen.kt` (fix coordinate math, add pulse animation, nearest-water logic)

---

### Feature 10 — Missing Vibe Backfill (Data Pipeline)
**Target:** `src/data/lineup.json` and `android/app/src/main/assets/lineup.json`

**What it does:**
42 of 80 artists have no vibes assigned. Add a mapping script to `scripts/` that auto-assigns vibes from genres using a genre→vibe lookup table.

**Mapping table (representative):**
```
TECHNO         → Dance, Hard, Rave
ELECTRONIC     → Dance, Flow
AMBIENT        → Chill, Flow
METAL          → Hard, High Energy, Mosh
ROCK           → High Energy, Anthemic
INDIE          → Feel-good, Nostalgic
HIP-HOP        → Party, Anthemic, Sing-along
POP            → Sing-along, Feel-good, Party
EXPERIMENTAL   → Weird, Flow, Dark
JAZZ           → Chill, Flow
```

**Implementation:** Node.js script `scripts/backfill-vibes.mjs` — reads lineup.json, for each artist with empty vibes, looks up genres in mapping table, assigns union of matching vibes, writes back. Does not overwrite artists that already have vibes.

**Run:** `node scripts/backfill-vibes.mjs` → commit both JSON files → sync to Android assets.

---

## Phase 3 — Features Awaiting Real Data

These are **designed** now but not fully implemented until Sziget publishes schedule data:

### Schedule Screen — Full Timetable
- `startTime` + `endTime` + `stage` fields are all `null` today
- The `ScheduleScreen` is already built with day tabs and clash detection logic
- When data arrives: populate the JSON, the screen lights up automatically
- **Prepare now:** Add `ScheduleViewModel` with `activeDay` + filtered/sorted artist list; the clash detection code is already there

### Food Finder
- `food.json` has 10 placeholder vendors
- Design the `FoodScreen` now with cuisine filters, price range filter, "budget pick" highlight
- Wire to `FoodRepository` which already exists
- Replace with real vendors when Sziget publishes food partner list

### Push Notifications — Day Reminders
- Once we know "headliners play Saturday", send a morning reminder: "Tonight: [Headliner]. 5 things to know →"
- Use WorkManager + NotificationManager
- Design the settings UI in Tools now (toggle per headliner)

---

## What NOT to Build in Phase 3

- **GPS / real-time location** — Requires permissions, complex UX, and the festival map is not georeferenced
- **Social features / friend sync** — Requires backend; out of scope
- **Spotify OAuth** — The web app has this; Android port is possible but complex; defer to Phase 4
- **In-app purchases** — Not part of this project

---

## File Change Summary

| New Files | Modified Files |
|-----------|---------------|
| `ui/quiz/VibeQuizScreen.kt` | `ui/discover/DiscoverScreen.kt` |
| `ui/quiz/VibeQuizViewModel.kt` | `ui/discover/DiscoverViewModel.kt` |
| `ui/quiz/VibeResultScreen.kt` | `ui/artist/ArtistDetailScreen.kt` |
| `ui/lineup/MyLineupScreen.kt` | `ui/home/HomeScreen.kt` |
| `ui/lineup/MyLineupViewModel.kt` | `ui/tools/ToolsScreen.kt` |
| `ui/lineup/LineupCardExporter.kt` | `ui/map/MapScreen.kt` |
| `ui/discover/CountryExplorerSheet.kt` | `ui/passport/PassportScreen.kt` |
| `ui/home/LineupDiffSheet.kt` | `ui/passport/PassportViewModel.kt` |
| `data/repository/LineupDiffRepository.kt` | `data/local/AppDatabase.kt` (version++) |
| `ui/passport/ChallengeEngine.kt` | `data/local/UserProgress.kt` |
| `ui/passport/ChallengeListScreen.kt` | `data/local/UserDao.kt` |
| `ui/discover/SerendipityScreen.kt` | `ui/navigation/Navigation.kt` |
| `ui/tools/SurvivalGuideScreen.kt` | — |
| `data/content/SurvivalGuideContent.kt` | — |
| `scripts/backfill-vibes.mjs` | `src/data/lineup.json` |

---

## Priority Order

1. **Map Fix** — Broken UI, quick fix, high visible impact
2. **Vibe Backfill** — Improves Discover + Quiz quality for 42 artists
3. **Vibe DNA Quiz** — Signature feature, high delight, works with all data
4. **More Like This** — High engagement, small scope
5. **Country Explorer** — Medium scope, good discovery feature
6. **Serendipity Mode** — Small scope, high fun
7. **Enhanced Passport Challenges** — Medium scope, increases retention
8. **2025→2026 Diff** — Unique feature, needs second JSON loading
9. **My Lineup Planner** — Medium scope, high utility, DB changes
10. **Survival Guide** — Pure content, low risk, high practical value
