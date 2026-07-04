# TASKS.md — Open & Unfinished Work

The single backlog file. Everything that was started (or promised via a feature flag) but not finished lives here.
When something ships, move a one-liner to "Recently Shipped" in `docs/STATUS.md` and delete it here.

Last groomed: 2026-07-04

---

## 1. Blocked on external data (nothing to code yet)

| Task | Trigger |
|---|---|
| Frequency 2026 timetable | Schedule publication → `npm run lineup:update:frequency`, set `features.timetable: true` |
| Ernte Punk 2026 timetable | Schedule publication → `npm run lineup:update:ernte-punk`, set `features.timetable: true` |
| Sziget: 16 artists without a time slot | Final official schedule details |
| `secretStages` | Festivals never announce these in advance — needs on-site/leak data. Flag exists, no UI on either platform |

---

## 2. Feature flags that promise more than the code delivers

These flags exist in `config.json` / `festival-engine.ts` / `FestivalConfig.kt` but have **no UI behind them**. Either build them or remove the flags — a flag without a feature is repo noise.

| Flag | Web | Android | Notes |
|---|---|---|---|
| `afterMovie` | ❌ | ❌ | Just a link card to the official recap video — cheap win |
| `newsBulletin` | ❌ | ❌ | Static pre-loaded announcements |
| `posterGenerator` | ❌ | ❌ | Offline-generated "my lineup" share image |
| `groupSchedules` | ❌ | ❌ | Compare two people's highlights locally (P2P) |
| `stageCapacity` | ❌ | ❌ | Questionable — crowd levels need live data, may violate offline mandate. Consider deleting the flag |
| `customThemes` | ❌ | ❌ | Per-user theme selection |
| `familyZone` | ❌ | ❌ | POI filter — small task, poi.json category + map filter |
| `feedbackSystem` | ✅ | ❌ | Web card exists; Android missing |
| `waterCounter` | ✅ | ❌ | Android ToolsScreen card missing |
| `setlistLinks` | ✅ | ❌ | Android ArtistDetailScreen section missing |

---

## 3. Web

- [ ] **Service worker update prompt** — PWA users silently get stale deploys until the browser refreshes `sw.js`. Needs a "new version available → reload" toast.
- [ ] **Timetable mobile compact mode** — 18 Sziget stages × 200px min column = ~3000px horizontal scroll on a phone. Needs a collapsed single-column / list mode.
- [ ] **Timetable tier distinction** — `must_see` vs `interested` favorites render identically in the grid. Different border/star for must_see.
- [ ] **Timetable horizontal-scroll affordance** — scrollbar is hidden (`no-scrollbar`); nothing signals there are more stages to the right.
- [ ] **Cross-day favorites summary** — no view of all your favorites across all days ("My Schedule"); you must click through each day tab.
- [ ] **Schedule export** — iCal / share link of favorited sets.
- [ ] **Lineup diff (2025 vs 2026) data gaps** — `lineup_2025.json` is missing for Ernte Punk and Rock am Ring, so the `LineupDiff` component silently shows nothing there. Add data or hide the section per festival. (Sziget's copy existed only in synced output; it was moved into `festivals/sziget-2026/data/` on 2026-07-04.)
- [ ] **Clash detection time-math consistency** — `use-clash-resolver` parses via `new Date()` while the grid uses string-sliced `wallMinutes()`. Works, but inconsistent; unify on `wallMinutes`.

## 4. Android

- [ ] **Accessibility audit** — no `contentDescription` pass has ever been done.
- [ ] **ArtistViewModel tests** — needs Room in-memory DB (complex without Robolectric).
- [ ] **ToolsViewModel tests** — currently would make real Open-Meteo calls; needs a network fake.
- [ ] **Festival switch UX** — `switchFestival()` restarts the whole app via launch intent. Works but abrupt (no transition). Acceptable for now; revisit before store release.
- [ ] **`applicationId` is still `com.example.festivalinsider`** — must change before any Play Store release.
- [ ] **Instrumented UI tests** — zero UI-level tests on Android; unit tests only.

## 5. Repo hygiene / chores

- [ ] **`scripts/scrape-frequency-enhanced.mjs`** — not wired into package.json. Decide when Frequency data lands: wire it in or delete it.
- [ ] **`scripts/add-festival.mjs`** — utility, not in package.json. Fine to keep, but verify it still matches the current config schema before next use.
- [ ] **Sziget `showInSchedule: false` artists (27)** — hidden from the grid by design; re-check against the official app before the festival (Aug 9).

---

## Done means done

Before checking anything off: `npm run typecheck` + `npm run lint` + `npm test -- --run` (web), `./gradlew test` (Android).
