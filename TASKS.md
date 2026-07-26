# TASKS.md — Open & Unfinished Work

The single backlog file. Everything that was started (or promised via a feature flag) but not finished lives here.
When something ships, move a one-liner to "Recently Shipped" in `docs/STATUS.md` and delete it here.

Every item below was re-verified against the code on **2026-07-26**; file paths and line references are exact. Completed work is not kept here — it moves to "Recently Shipped" in `docs/STATUS.md`.

---

## P2 — Blocked on external data

| Task | Trigger |
|---|---|
| Ernte Punk 2026 timetable | Schedule publication → `npm run lineup:update:ernte-punk`, set `features.timetable: true`. All 17 acts currently have `null` times |
| Sziget: 20 artists without a time slot | Final official schedule details (431/451 scheduled) |
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

---

## P3 — Web UX improvements (component is sound, these are gaps)

- [ ] **Cross-day favorites summary** — no "My Schedule" view across all days.
- [ ] **Schedule export** — iCal / share link of favorited sets.
- [ ] **Lineup diff (2025 vs 2026) data gaps** — `lineup_2025.json` missing for Ernte Punk and Rock am Ring; `LineupDiff` silently renders nothing there. Add data or hide the section per festival.

---

## P3 — Half-finished systems (web)

- [ ] **i18n partially adopted** — `use-translation` is wired into exactly 3 components (`tools/page.tsx`, `bottom-nav.tsx`, `header.tsx`); the rest of the UI is hardcoded English. Decide: roll it out or declare English-only and delete the half-system.
- [ ] **Test coverage gaps** — 190 tests cover hooks and small components. Still untested: `timetable-view` (day sorting, live/past states, the 06:00 rollover) and the whole PWA/service-worker layer. `insider-provider` now has one test, for the cross-festival favorites bleed only.

---

## P3 — Android

- [ ] **AI Scout — works on paper, never run on a device.** The prompt layer is done: bounded retrieval (top-20 candidates ranked by query overlap, flat prompt size), persona from `config.aiPersona`, one `buildScoutPrompt()` builder that includes `day · time · stage`, and Gemini Nano via the ML Kit Prompt API so there is no model for us to host. What remains is verification — it needs a device with AICore support; nobody has watched it answer a question yet.
- [ ] **Location Scout — same caveat.** GPS → nearest stage → "who's playing here now" is implemented with an offline fallback, but is likewise unverified on hardware.
- [ ] **Accessibility audit** — no `contentDescription` pass has ever been done.
- [ ] **ArtistViewModel tests** — needs Room in-memory DB (complex without Robolectric).
- [ ] **ToolsViewModel tests** — currently would make real Open-Meteo calls; needs a network fake.
- [ ] **Festival switch UX** — full app restart via launch intent; abrupt but functional. Revisit before store release.
- [ ] **Confirm `applicationId` before any Play Store release.** It is `org.openfestivalhub`, which matches the rename — but the reverse-DNS id implies a domain nobody has registered, and it is unchangeable once published. Decide deliberately; changing it later orphans every user's Room DB and asset paths.
- [ ] **Instrumented UI tests** — zero UI-level tests on Android; unit tests only.

---

## P4 — Repo hygiene / chores

- [ ] **`scripts/scrape-frequency-enhanced.mjs`** — not wired into package.json and the Frequency timetable has since landed (hand-parsed, 2026-07-25). Decide now: wire it in for re-scrapes, or delete it.
- [ ] **`scripts/add-festival.mjs`** — utility, not in package.json. Verify it still matches the current config schema before next use.
- [ ] **Sziget `showInSchedule: false` artists (27)** — hidden from the grid by design; re-check against the official app before Aug 9.

---

## Done means done

Before checking anything off: `npm run typecheck` + `npm run lint` + `npm test -- --run` + `npm run validate` (web), `./gradlew test` (Android). Anything touching the PWA/service-worker layer is invisible in local dev — verify it on the deployed GitHub Pages site.
