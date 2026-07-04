# Project Status — Festival Insider 2026

> Live snapshot. Update this after significant changes. Last updated: 2026-07-04.

---

## Platform Health

| Check | Status | Detail |
|---|---|---|
| Web TypeScript | ✅ 0 errors | `npm run typecheck` |
| Web tests | ✅ 189 passing | `npm test -- --run` |
| Web lint | ✅ Clean | `npm run lint` |
| Android Kotlin compile | ✅ 0 errors | Only deprecation warnings (pre-existing) |
| Android unit tests | ✅ Passing | `./gradlew test` |
| Deployed | ✅ Live | https://atzsta13.github.io/studio/ (GitHub Pages, auto-deploy on push to main) |

---

## Architecture State

Single website + single Android APK. This was refactored on 2026-06-12.

| | Before | Now |
|---|---|---|
| Android | 6 product flavors (6 APKs) | 1 APK (`com.example.festivalinsider`) |
| Web | Hub page only, no in-page switcher | Header has `FestivalSwitcher` dropdown on all festival pages |
| Android assets | `src/<flavor>/assets/` | `src/main/assets/<festival-id>/` |
| First launch (Android) | Opened into hardcoded festival | Routes to `FestivalSelectionScreen` |

---

## Data Coverage

| Festival | Artists | Schedule | Stage data | Notes |
|---|---|---|---|---|
| Sziget 2026 | 458 | ✅ 442/458 | ✅ 447/458 have stage | Full timetable live (Aug 9–16). 431 flagged showInSchedule. ISO 8601 with CEST (+02:00). |
| Nova Rock 2026 | 84 | ✅ 84/84 | ✅ | Festival ran Jun 11–14. Lineup = official timetable, verified line-by-line against novarock.at. ISO 8601 with CEST (+02:00). |
| Rock am Ring 2026 | 73 | ✅ 73/73 | ✅ | Full timetable, ISO timestamps. Festival ran Jun 5–7. |
| Area 53 2026 | 30 | ✅ 30/30 | ✅ | Full timetable (Jul 15–18, incl. Wednesday warm-up + aftershows), ISO timestamps. |
| Frequency 2026 | 95 | ❌ TBA | ❌ | No schedule yet. |
| Ernte Punk 2026 | 17 | ❌ TBA | ❌ | No schedule yet. |

---

## Open Issues

### Critical

None currently.

### Data

**Canonical time format: ISO 8601 with explicit offset.**
All `startTime`/`endTime` values in every festival's `lineup.json` must be full ISO 8601 timestamps with offset (e.g. `"2026-07-16T22:30:00+02:00"`). Android parses ISO first with an `HH:mm` fallback (`ui/utils/FestivalUtils.kt`), but new data must always be ISO. Area 53 was migrated on 2026-06-12 (`scripts/migrate-area53-times.mjs`).

**Sziget timetable is live.**
442/458 artists have `startTime`. 16 artists remain without a time slot. `features.timetable` is `true` in Sziget's config.

### Android

**SharedPreferences unencrypted — won't fix.**
The only persisted preference is the selected festival ID; there are no tokens, credentials, or PII anywhere. `EncryptedSharedPreferences` is deprecated upstream. Closed as won't-fix (2026-06-12 audit).

**`FestivalSelectionScreen` navigation after switch.**
`FestivalConfig.switchFestival()` restarts the app via `getLaunchIntentForPackage`. This works but is abrupt — no transition animation and the system treats it as a new launch. Acceptable for now.

### Web

**PWA/offline layer is dead in production (audited 2026-07-04).**
The service worker never registers on GitHub Pages (`register('/sw.js')` ignores the `/studio` basePath), the manifest link 404s, the manifest itself is Sziget-branded for all six festivals, and set-time notifications gate on a browser API that was removed in 2021. Full diagnosis with fixes: `TASKS.md` → P0. This is why PWA users silently get stale deploys.

### Features blocked on schedule data

These features are implemented but show nothing meaningful for festivals with null schedules:

| Feature | Blocked for | Unblocked for |
|---|---|---|
| `clashResolver` | Frequency, Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53 |
| `setCountdowns` | Frequency, Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53 |
| `vibeOfTheHour` | Frequency, Ernte Punk | Sziget, Nova Rock, Rock am Ring, Area 53 |
| `groupSchedules` | All (feature pending) | — |

`features.timetable` is `false` for Frequency and Ernte Punk — re-enable per festival when schedule data lands. Sziget is now `true`.

---

## Recently Shipped

| Date | What |
|---|---|
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
