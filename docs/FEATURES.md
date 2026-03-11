# Feature Status

Honest, current-state inventory. Features are marked by actual build status, not aspiration.

**Legend:**
- ✅ Built and wired — exists in production code
- 🚧 In progress — partially built or in current sprint
- ⏳ Awaiting data — designed, blocked on Sziget publishing schedule/venue data
- ❌ Not built — was mentioned in early docs, deprioritised

---

## Artist Discovery

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Artist grid / list | ✅ | ✅ | 80 artists |
| Search (fuzzy name/genre/bio) | ✅ | ✅ | Real-time filter |
| Filter by festival day | ✅ | ✅ | ~53% of artists have a day |
| Filter by genre | ✅ | ✅ | |
| Filter by vibe / mood | ✅ | ✅ | 100% coverage after backfill |
| Filter by headliner | ✅ | ✅ | 6 headliners |
| Sort A–Z / headliners first | ✅ | ✅ | |
| Artist detail page | ✅ | ✅ | Bio, genres, vibes, socials, image |
| In-app music preview (Spotify embed) | ✅ | ✅ | Web: iframe; Android: WebView |
| "More Like This" (similar artists) | ✅ | ✅ | Genre/vibe crossmatch |
| AI natural language recommendations | ✅ | ❌ | Web only — Genkit + Gemini 2.5 Flash |
| Spotify match engine | ✅ | ❌ | Web only — OAuth flow, scans saved tracks |
| Spotify playlist auto-builder | ✅ | ❌ | Web: POST /api/spotify/build-playlist, top-3 tracks per artist |
| Vibe DNA Quiz | ❌ | ✅ | Android only |
| "Serendipity" random discovery | ❌ | ✅ | Android: SerendipityScreen |
| Country explorer | ✅ | ✅ | Web: by-country view; Android: CountryExplorerSheet |
| 2025 vs 2026 lineup diff | ✅ | ❌ | Web: year toggle on Discover |

---

## Schedule & Planning

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Day-based artist browse | ✅ | ✅ | Day filter on both platforms |
| Stage/time timetable grid | ⏳ | ⏳ | Data not published by Sziget yet |
| Clash detection | ⏳ | ⏳ | Blocked on time data |
| Personal lineup planner | ❌ | ❌ | Phase 3 backlog |
| Shareable lineup card | ❌ | ❌ | Phase 3 backlog |
| Set reminders / notifications | ❌ | ❌ | Requires time data + WorkManager |

---

## Map

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| POI map (stages, water, toilets, first aid) | ✅ | ✅ | Placeholder coordinates |
| Category filter | ✅ | ✅ | ALL / STAGES / FOOD / WATER |
| Hydration mode (water-only highlight) | ✅ | ✅ | Android: pulsing cyan animation |
| Nearest water station indicator | ❌ | ✅ | Android only |
| "Mark my tent" GPS pin | ✅ | ✅ | Web: localStorage + compass; Android: SharedPreferences + bearing arrow |
| Real venue / stage coordinates | ⏳ | ⏳ | Awaiting Sziget map data |

---

## Food & Drink

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Food vendor browser | ✅ | ✅ | Web: /food; Android: FoodScreen (accessed from Map → FOOD chip) |
| Search by name / cuisine | ✅ | ✅ | |
| Category filter (Food / Drink) | ✅ | ✅ | |
| Dietary filter (Vegan, Gluten-Free) | ✅ | ✅ | Filters vendor.tags array |
| Budget Hero filter | ✅ | ✅ | Vendors with budgetOption set |
| Dietary tag pills on vendor cards | ✅ | ✅ | |
| Real 2026 vendor data | ⏳ | ⏳ | Placeholder data in food.json |

---

## Gamification & Passport

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Stamp collection | ✅ | ✅ | 8 predefined stamps |
| XP / rank system | ✅ | ✅ | Room-persisted on Android |
| Challenge system | ❌ | ✅ | Android: 7 challenges |
| Favoriting artists | ✅ | ✅ | Room-persisted on Android; Firebase on Web |
| Post-festival highlights wrap | ✅ | ✅ | Web: /highlights; Android: HighlightsScreen (via Passport) |

---

## Survival Toolkit

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| HUF currency converter | ✅ | ✅ | Hardcoded rate — update manually pre-festival |
| SOS strobe beacon | ✅ | ✅ | Both: full-screen flash overlay |
| Emergency contacts (dial) | ✅ | ✅ | 112 security, 104 medical |
| Weather forecast (7-day) | ✅ | ✅ | Open-Meteo API, Budapest coords, 30-min cache |
| Rain alert | ✅ | ✅ | Triggers if any next-24h hour >60% precipitation |
| Festival survival guide | ✅ | ✅ | Web: /guide subpages; Android: SurvivalGuideScreen |
| Hungarian phrase clipboard | ❌ | ✅ | Android only |
| Packing list | ✅ | ❌ | Web only |

---

## Technical & Platform

| Feature | Web | Android | Notes |
|---------|-----|---------|-------|
| Offline-first (PWA service worker) | ✅ | ✅ | Web: sw.js caches app shell + assets + weather; Android: all data bundled |
| Brutalist dark OLED UI | ✅ | ✅ | OLEDBlack, AcidYellow, PrimaryMagenta, ToxicGreen, CyanPulse |
| Haptic feedback | ❌ | ✅ | Android: HapticManager on all interactions |
| Animated splash screen | ❌ | ✅ | |
| Page transitions (fade) | ❌ | ✅ | NavHost enter/exit transitions |
| Home screen widget | ❌ | ✅ | Android: Glance widget — rank, XP, favorites count |
| Country flag emoji | ✅ | ✅ | |
| PWA install prompt | ✅ | ❌ | Web only |

---

## Data dependencies

Some features cannot be fully built until Sziget publishes official data:

| Blocked feature | Missing data | Where to add when available |
|----------------|-------------|----------------------------|
| Full timetable grid | `stage`, `startTime`, `endTime` per artist | `src/data/lineup.json` → sync to `android/app/src/main/assets/lineup.json` |
| Clash detection (live) | Same as above | Logic stubbed in ScheduleScreen |
| Real food vendor map | 2026 vendor list with map coordinates | `src/data/food.json` → sync to Android assets |
| Real stage map pins | Stage coordinates for Óbudai-sziget | `src/data/poi.json` → sync to Android assets |
| Home screen widget "now playing" | Time data | Update `SzigetWidget.kt` when available |

---

## Planned / backlog

Features not yet built, prioritised from `FEATURES.md` in the repo root:

- **Clash detection** (#3) — logic ready, awaiting schedule data
- **Personal schedule builder** (#7) — time-slotted plan, different from favourites
- **"Now playing" live indicator** (#10) — which acts are on right now
- **Spotify Android integration** — match library against lineup
- **Push notifications** — day-of reminders (WorkManager + FCM)
- **Friend sync / shared wishlists** — requires a backend
- **Accessibility map** (#141) — wheelchair routes, accessible toilets
- **Multi-language support** (#159) — English + Hungarian minimum
