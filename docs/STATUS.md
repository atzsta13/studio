# Project Status — Open Festival Hub 2026

> Live snapshot. Update this after significant changes. Last updated: 2026-07-26.

---

## Platform Health

| Check | Status | Detail |
|---|---|---|
| Web TypeScript | ✅ 0 errors | `npm run typecheck` |
| Web tests | ✅ 190 passing | `npm test -- --run` |
| Web lint | ✅ Clean | `npm run lint` |
| Android Kotlin compile | ✅ 0 errors | Only deprecation warnings (pre-existing) |
| Android unit tests | ✅ Passing | `./gradlew test` |
| Deployed | ⚠️ Live, manual only | https://atzsta13.github.io/studio/ (GitHub Pages). Auto-deploy paused since 2026-07-10 — deploy via Actions → `workflow_dispatch` |

---

## Architecture State

Single website + single Android APK. This was refactored on 2026-06-12.

| | Before | Now |
|---|---|---|
| Android | 6 product flavors (6 APKs) | 1 APK (`org.openfestivalhub`) |
| Web | Hub page only, no in-page switcher | Header has `FestivalSwitcher` dropdown on all festival pages |
| Android assets | `src/<flavor>/assets/` | `src/main/assets/<festival-id>/` |
| First launch (Android) | Opened into hardcoded festival | Routes to `FestivalSelectionScreen` |

---

## Data Coverage

| Festival | Artists | Schedule | Stage data | Notes |
|---|---|---|---|---|
| Sziget 2026 | 451 | ✅ 431/451 | ✅ 440/451 have stage | Full timetable live (Aug 9–16). 424 flagged showInSchedule. ISO 8601 with CEST (+02:00). 42 duplicate rows removed across 2026-07-25/26. |
| Nova Rock 2026 | 84 | ✅ 84/84 | ✅ | Festival ran Jun 11–14. Lineup = official timetable, verified line-by-line against novarock.at. ISO 8601 with CEST (+02:00). |
| Rock am Ring 2026 | 73 | ✅ 73/73 | ✅ | Full timetable, ISO timestamps. Festival ran Jun 5–7. |
| Area 53 2026 | 32 | ✅ 32/32 |  ✅ | Full timetable, verified line-by-line against the official 2026 poster + area53festival.at (2026-07-10). Music runs Thu–Sat (Jul 16–18); Wednesday warm-up + nightly Tenne aftershows included. ISO timestamps. **Data note:** the Sat 12:30 act is **`Apis`** — its stylized poster logo misreads as "ARIS"; confirmed Apis. Do not "correct" it back. |
| Frequency 2026 | 82 | ✅ 82/82 | ✅ | Full timetable (Aug 20–22), 5 stages, parsed from frequency.at/en/timetable/ on 2026-07-25. Nightstage runs to 05:30, so post-midnight sets carry the next date. ISO 8601 with CEST (+02:00). |
| Ernte Punk 2026 | 17 | ❌ TBA | ❌ | No schedule yet. |

---

## Open Issues

### Critical

None.

### Data

**Canonical time format: ISO 8601 with explicit offset.**
All `startTime`/`endTime` values in every festival's `lineup.json` must be full ISO 8601 timestamps with offset (e.g. `"2026-07-16T22:30:00+02:00"`). Android parses ISO first with an `HH:mm` fallback (`ui/utils/FestivalUtils.kt`), but new data must always be ISO. Area 53 was migrated to ISO on 2026-06-12; its one-off migration script has since been deleted.

**Sziget timetable is live.**
431/451 artists have `startTime`. 20 artists remain without a time slot. `features.timetable` is `true` in Sziget's config.

### Android

**SharedPreferences unencrypted — won't fix.**
The only persisted preference is the selected festival ID; there are no tokens, credentials, or PII anywhere. `EncryptedSharedPreferences` is deprecated upstream. Closed as won't-fix (2026-06-12 audit).

**`FestivalSelectionScreen` navigation after switch.**
`FestivalConfig.switchFestival()` restarts the app via `getLaunchIntentForPackage`. This works but is abrupt — no transition animation and the system treats it as a new launch. Acceptable for now.

### Web

**Service-worker update prompt — verified working (2026-07-26).** Previously logged as missing. The chain is complete: `pwa-loader.tsx` fires `sw-update-available` on `updatefound`, `use-sw-update.ts` listens, `SwUpdateBanner` (mounted in `app/layout.tsx`) offers the reload, and `sw.js` handles `SKIP_WAITING`.

**GitHub Pages auto-deploy still paused (since 2026-07-10) — probably no longer needed.**
The `push` trigger in `.github/workflows/deploy-pages.yml` is commented out, so merges to `main` do not redeploy; manual `workflow_dispatch` still works. The pause was for the broken PWA/offline layer, and those fixes shipped on 2026-07-04 (registration basePath, scope, manifest, cross-origin caching). Nothing in the backlog now blocks a deploy. **Decision needed:** verify the live site once, then uncomment the trigger.

### Features blocked on schedule data

These features are implemented but show nothing meaningful for festivals with null schedules:

| Feature | Blocked for | Unblocked for |
|---|---|---|
| `clashResolver` | Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53, Frequency |
| `setCountdowns` | Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53, Frequency |
| `vibeOfTheHour` | Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53, Frequency |
| `groupSchedules` | All (feature pending) | — |

`features.timetable` is `false` only for Ernte Punk — re-enable when its schedule data lands. Every other festival is `true`.

---

## Recently Shipped

| Date | What |
|---|---|
| 2026-07-26 | Housekeeping: removed the fake `audioMonitor` dB meter from both platforms (it never measured anything — hardcoded "102dB" on web and a `// Simulated Meter` on Android) and the flag from all configs; dropped the unused MediaPipe `tasks-genai` dep and the dead CameraX/barcode entries from the version catalog; tightened the camera/mic mandate to absolute; deleted `ISSUES.md` + `android/HANDOFF.md` |
| 2026-07-25 | Frequency 2026 full timetable — 82 slots across 5 stages (Aug 20–22), `features.timetable: true`. Lineup reconciled 95→82: 12 duplicate scraper entries collapsed, Lina-Mariah added, Missio + t-low removed (dropped from the bill). Nightstage runs to 05:30, so post-midnight sets roll to the next date |
| 2026-07-25 | Sziget deduped — 30 exact duplicate rows removed (headliners rendered twice); now 463 acts, 443 scheduled |
| 2026-07-10 | Android feature pass (Gemini, verified): implemented `waterCounter`/`hydrationTracker` + `feedbackSystem` cards on Android (web parity closed); replaced the mic-based Acoustic Scout with a GPS **Location Scout** (nearest-stage → "who's playing now") and removed the `RECORD_AUDIO`/`CAMERA` permissions + CameraX/ML Kit deps (latent constraint violations); edge-to-edge insets in Navigation; web `ArtistImage` now falls back to an initial-letter placeholder on broken hotlinks. Both platforms green |
| 2026-07-10 | Build perf: enabled Gradle parallel + build cache + configuration cache and raised daemon heap 2G→4G (clean build 41s→3s, incremental ~8-20s→1s on an 8-core machine); `next dev` now uses Turbopack. Production web build stays on webpack (Turbopack only ~4% there — cost is static-export prerender, not compile) |
| 2026-07-10 | Removed the `setlistLinks` feature entirely (UI-only link-out to setlist.fm, no data, Android port never built) — component, flag, types, all configs, and docs. No festival data touched |
| 2026-07-10 | Paused GitHub Pages auto-deploy (site under maintenance) — commented out the workflow `push` trigger; manual `workflow_dispatch` still available |
| 2026-07-10 | Dep bumps (safe tier): React 19.0→19.2, Next 16.1→16.2, Compose BOM 2026.05.00→2026.06.01, plus in-range minors. Held: MUI 6→9, TypeScript 5→7, lucide 0→1, recharts 2→3 (breaking, deferred past the festivals) |
| 2026-07-10 | AI Scout prompt layer refactor — bounded retrieval (top-20 candidates, was the entire lineup in a 512-token budget), persona now read from `config.aiPersona` (was hardcoded), single `buildScoutPrompt` builder with schedule context, maxTokens 512→2048, removed fake word-by-word streaming |
| 2026-07-10 | Area 53 timetable rebuilt from the official 2026 poster — prior data was a stale, scrambled running order (headliners on wrong days, all set times off, Morituri listed while Cavalera/The Devastation/Enter Infinite were missing). Corrected days/times, removed Morituri, added the 3 missing acts, moved Patriarcha to Thu 13:20, fixed Jazz Gitti to 11:15–12:00. Synced to public/data + Android assets |
| 2026-07-04 | Fixed PWA/offline layer (registration basePath, scope, neutral manifest.json, 512px icon, cross-origin open-meteo caching), corrected Sziget timetable day mapping with 06:00 rollover, resolved favorites bleed, unified clash detection, deleted 21 unused UI components, pruned 56 unused dependencies, deleted dead stageCapacity flag, updated config productionUrl values, added live day auto-selection, styled must_see vs interested favorite tiers in the timetable grid, and added horizontal scroll indicators/gradients |
| 2026-07-04 | Docs housekeeping round 2 — vendor LLM files streamlined (deleted legacy Cursor rules; Copilot pointer made literal), corrected TIMETABLE.md notification claims, fixed stale counts/claims across GOALS, UI_GUIDE, TROUBLESHOOTING |
| 2026-07-04 | Web deep-dive audit documented in TASKS.md (broken PWA layer in production, provider favorites bug, dead weight inventory) |
| 2026-07-04 | Repo cleanup — deleted stale snapshot docs (CURRENT.md, UPDATED.md, LLM_BRIEF.md, VERIFICATION.md), removed legacy `src/data/` sync path, created TASKS.md as the single backlog file |
| 2026-07-02 | Timetable: live/past set states, set time ranges, artist search — web + Android parity |
| 2026-06-28 | Sziget 2026 full timetable live — 442/458 artists, Aug 9–16, features.timetable enabled |
| 2026-06-12 | ISO 8601 time-format unification (Area 53 migration, Android ISO parsing, utcOffsetHours, stability fixes) — deployed + verified against novarock.at |
| 2026-06-12 | Nova Rock full timetable (84 artists, live data from novarock.at) |
| 2026-06-12 | Single-APK Android refactor + FestivalSwitcher on web |
| 2026-06-12 | ARCHITECTURE.md full rewrite for AI/cold-start readability |
| 2026-06-10 | Android toolchain Jun 2026 + Coil 3 migration |
| 2026-06-09 | Rock am Ring Android flavor + timetable timezone fix |
| 2026-06-08 | Rock am Ring 2026 added (73 artists, full timetable) |

---

## Pending / Next Up

See `TASKS.md` (repo root) — the single backlog file for all open and unfinished work.

---

## Docs Map

| File | Purpose |
|---|---|
| `AGENTS.md` | AI agent instructions — commands, constraints, architecture summary |
| `TASKS.md` | Open/unfinished work — the only backlog file |
| `docs/architecture/ARCHITECTURE.md` | Deep-dive reference for models/engineers joining cold |
| `docs/GOALS.md` | The **why** behind every feature |
| `docs/features/FEATURES.md` | Feature matrix (Web ✅/⏳, Android ✅/⏳) |
| `docs/STATUS.md` | **This file** — live state snapshot |
| `docs/guides/MANDATES.md` | Hard constraints (privacy, offline, config-first) |
| `docs/guides/TROUBLESHOOTING.md` | Dev troubleshooting |
| `docs/guides/UI_GUIDE.md` | UI/UX design system reference |
