# TASKS.md — Open & Unfinished Work

The single backlog file. Everything that was started (or promised via a feature flag) but not finished lives here.
When something ships, move a one-liner to "Recently Shipped" in `docs/STATUS.md` and delete it here.

Items marked **[audited]** were verified against the actual code/build on 2026-07-04 — file paths and line references are exact, fixes are specified so any agent can pick them up cold.

Last groomed: 2026-07-04

---

---

## P2 — Blocked on external data

| Task | Trigger |
|---|---|
| Frequency 2026 timetable | Schedule publication → `npm run lineup:update:frequency`, set `features.timetable: true` |
| Ernte Punk 2026 timetable | Schedule publication → `npm run lineup:update:ernte-punk`, set `features.timetable: true` |
| Sziget: 16 artists without a time slot | Final official schedule details |
| `secretStages` | Needs on-site/leak data. Flag exists, no UI on either platform |

---

## P2 — Feature flags that promise more than the code delivers

These flags exist in `config.json` / `festival-engine.ts` / `FestivalConfig.kt` but have **no UI behind them**. Build them or remove the flags — a flag without a feature is repo noise.

| Flag | Web | Android | Notes |
|---|---|---|---|
| `afterMovie` | ❌ | ❌ | Just a link card to the official recap video — cheap win |
| `newsBulletin` | ❌ | ❌ | Static pre-loaded announcements |
| `posterGenerator` | ❌ | ❌ | Offline-generated "my lineup" share image |
| `groupSchedules` | ❌ | ❌ | Compare two people's highlights locally (P2P) |
| `customThemes` | ❌ | ❌ | Per-user theme selection |
| `familyZone` | ❌ | ❌ | POI filter — small task: poi.json category + map filter |
| `feedbackSystem` | ✅ | ❌ | Web card exists; Android missing |
| `waterCounter` | ✅ | ❌ | Android ToolsScreen card missing |
| `setlistLinks` | ✅ | ❌ | Android ArtistDetailScreen section missing |

---

## P3 — Web UX improvements (component is sound, these are gaps)

- [ ] **Timetable mobile compact mode** — 18 Sziget stages × 200px min column ≈ 3,600px horizontal scroll on a phone. Needs a collapsed single-column / by-time list mode (Android already has a BY-TIME tab; web has nothing).
- [x] **Auto-select the live day** — `timetable-view.tsx` always opens on day tab 0; during the festival it should open on today.
- [x] **Timetable tier distinction** — `must_see` vs `interested` favorites render identically in the grid.
- [x] **Horizontal-scroll affordance** — scrollbar is hidden (`no-scrollbar`); nothing signals more stages to the right.
- [ ] **Cross-day favorites summary** — no "My Schedule" view across all days.
- [ ] **Schedule export** — iCal / share link of favorited sets.
- [ ] **Lineup diff (2025 vs 2026) data gaps** — `lineup_2025.json` missing for Ernte Punk and Rock am Ring; `LineupDiff` silently renders nothing there. Add data or hide the section per festival.

---

## P3 — Dead weight (web) **[audited]**

- [x] **21 unused ShadCN components** in `src/components/ui/` — zero imports outside the ui folder itself: `alert-dialog`, `alert`, `avatar`, `calendar`, `carousel`, `chart`, `collapsible`, `form`, `label`, `menubar`, `popover`, `radio-group`, `select`, `separator`, `sheet`, `sidebar` (~770 lines), `skeleton`, `slider`, `switch`, `table`, `tooltip`. Keep `toast`/`toaster` (used via `use-toast`). Re-verify each with grep before deleting, then run typecheck + tests + build.
- [x] **Unused/misplaced dependencies** (`package.json`): `@mui/lab` (0 imports — also remove from `next.config.ts` optimizePackageImports), `react-hook-form` + `@hookform/resolvers` + `zod` (only consumer is the unused `ui/form.tsx`), `react-day-picker` (only unused `ui/calendar.tsx`), `embla-carousel-react` (only unused `ui/carousel.tsx`), `patch-package` (no `patches/` dir exists), `dotenv` (zero imports in src or scripts). Move `puppeteer` to devDependencies (only scrape scripts use it). Delete the dead ui components first, then the deps, then verify: typecheck + tests + full build.
- [x] **`productionUrl` relics in configs** — 4 festivals point to `*.vercel.app` domains from the pre-GitHub-Pages era; the real site is `atzsta13.github.io/studio`. Android's AI Scout builds its model-download URL from this field (see Android section). Update or remove the field.
- [ ] **i18n partially adopted** — `use-translation` is used in only 4 components; the rest of the UI is hardcoded English. Decide: roll out or declare English-only and remove the half-system.
- [ ] **Test coverage gaps** — tests cover hooks + small components only. Nothing for: `insider-provider` (favorites migration, the 1.2 contamination bug), `timetable-view` (day sorting, live/past states), PWA layer. The 1.2 fix should land with a regression test.

---

## P3 — Android

- [ ] **AI Scout is a non-functional prototype** **[audited 2026-07-04]** — three blockers, in order:
  1. `LocalScoutRepository.getLocalRecommendationsStreaming()` stuffs the **entire lineup** (458 artists for Sziget ≈ 15–18k tokens) into a prompt while `setMaxTokens(512)` is the total context budget → fails/truncates for every festival except the tiniest. Fix: pre-filter to ~top-20 candidates (genre/vibe/schedule match) before prompting, raise maxTokens to 2–4k.
  2. Model download URL is `config.productionUrl + "/ai/gemma4-2b-android.bin"` — nobody hosts a 1.2GB model at those (dead) URLs, and GitHub Pages can't (100MB limit). Only the adb-push "SCAN LOCAL" path works. Decide hosting or declare it a power-user feature.
  3. Fake streaming: blocking `generateResponse()` then word-by-word replay with 30ms delays. Use `generateResponseAsync`.
  - The Acoustic Scout maps mic RMS + zero-crossings to ~9 canned sentences — it cannot identify a set, and its prompt includes no schedule/stage data, so the LLM can't answer "who is playing right now" even though that data now exists. Reframe or feed it the live schedule.
- [ ] **Accessibility audit** — no `contentDescription` pass has ever been done.
- [ ] **ArtistViewModel tests** — needs Room in-memory DB (complex without Robolectric).
- [ ] **ToolsViewModel tests** — currently would make real Open-Meteo calls; needs a network fake.
- [ ] **Festival switch UX** — full app restart via launch intent; abrupt but functional. Revisit before store release.
- [ ] **`applicationId` is still `com.example.festivalinsider`** — must change before any Play Store release.
- [ ] **Instrumented UI tests** — zero UI-level tests on Android; unit tests only.

---

## P4 — Repo hygiene / chores

- [ ] **`scripts/scrape-frequency-enhanced.mjs`** — not wired into package.json. When Frequency data lands: wire it in or delete it.
- [ ] **`scripts/add-festival.mjs`** — utility, not in package.json. Verify it still matches the current config schema before next use.
- [ ] **Sziget `showInSchedule: false` artists (27)** — hidden from the grid by design; re-check against the official app before Aug 9.

---

## Done means done

Before checking anything off: `npm run typecheck` + `npm run lint` + `npm test -- --run` (web), `./gradlew test` (Android). For anything in P0, additionally verify on the deployed GitHub Pages site — every P0 item is invisible in local dev.
