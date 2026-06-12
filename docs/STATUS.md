# Project Status — Festival Insider 2026

> Live snapshot. Update this after significant changes. Last updated: 2026-06-12.

---

## Platform Health

| Check | Status | Detail |
|---|---|---|
| Web TypeScript | ✅ 0 errors | `chart.tsx` has 4 pre-existing ShadCN type errors — known, not blocking |
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
| Sziget 2026 | 339 | ❌ TBA | ✅ 292/339 have stage assigned | Times not yet published. Stage names set but no startTime/endTime. |
| Nova Rock 2026 | 89 | ✅ 84/89 | ✅ | **Currently happening** (Jun 11–14). 5 missing: Slipknot, Electric Callboy, Wanda, Static X, Badflower — absent from live timetable, likely cancelled. ISO 8601 timestamps with CEST (+02:00). |
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

**Nova Rock 5 artists without slots.**
Slipknot, Electric Callboy, Wanda, Static X, Badflower were not present on the live timetable page. They may have been cancelled or replaced. They remain in the lineup with null times and will not appear in the timetable view.

**Sziget stages without times.**
292 Sziget artists have a `stage` field set but `startTime: null`. This is correct — Sziget has not published its timetable — but means the timetable feature flag (`timetable: false` in Sziget's config) must stay off until data is available.

### Android

**SharedPreferences unencrypted — won't fix.**
The only persisted preference is the selected festival ID; there are no tokens, credentials, or PII anywhere. `EncryptedSharedPreferences` is deprecated upstream. Closed as won't-fix (2026-06-12 audit).

**`FestivalSelectionScreen` navigation after switch.**
`FestivalConfig.switchFestival()` restarts the app via `getLaunchIntentForPackage`. This works but is abrupt — no transition animation and the system treats it as a new launch. Acceptable for now.

### Web

**No service worker update prompt.**
When a new deploy is pushed, users on the PWA won't be prompted to refresh. They silently get stale cached data until they manually reload.

**`chart.tsx` TypeScript errors (4 errors, pre-existing).**
ShadCN recharts wrapper has type mismatches with the recharts library version. These do not affect runtime behavior. Filed as a known ShadCN/recharts incompatibility.

### Features blocked on schedule data

These features are implemented but show nothing meaningful for festivals with null schedules:

| Feature | Blocked for | Unblocked for |
|---|---|---|
| `clashResolver` | Sziget, Frequency, Ernte Punk | Nova Rock, Rock am Ring, Area 53 |
| `setCountdowns` | Sziget, Frequency, Ernte Punk | Nova Rock, Rock am Ring, Area 53 |
| `vibeOfTheHour` | Sziget, Frequency, Ernte Punk | Nova Rock, Rock am Ring, Area 53 |
| `groupSchedules` | All (feature pending) | — |

`features.timetable` is now `false` for Sziget, Frequency, and Ernte Punk — re-enable per festival when schedule data lands.

---

## Recently Shipped

| Date | What |
|---|---|
| 2026-06-12 | ISO 8601 time-format unification (Area 53 migration, Android ISO parsing, utcOffsetHours, stability fixes) — deployed + verified against novarock.at |
| 2026-06-12 | Nova Rock full timetable (84 artists, live data from novarock.at) |
| 2026-06-12 | Single-APK Android refactor + FestivalSwitcher on web |
| 2026-06-12 | ARCHITECTURE.md full rewrite for AI/cold-start readability |
| 2026-06-10 | Android toolchain Jun 2026 + Coil 3 migration |
| 2026-06-09 | Rock am Ring Android flavor + timetable timezone fix |
| 2026-06-08 | Rock am Ring 2026 added (73 artists, full timetable) |

---

## Pending / Next Up

These are real gaps, not backlog filler:

1. **Frequency + Ernte Punk timetable** — when published. Run `npm run lineup:update:frequency` / `npm run lineup:update:ernte-punk` and re-enable `features.timetable`.
2. **Sziget timetable** — highest impact when published (339 artists). Unlocks clash resolver and set countdowns for the main festival. Re-enable `features.timetable`.
3. **Service worker update prompt** — users on PWA get stale deploys silently.
4. **Nova Rock cancelled artists** — decide whether to remove Slipknot, Electric Callboy, Wanda, Static X, Badflower or add a `cancelled` flag + badge (needs maintainer decision). Confirmed absent from the official novarock.at timetable (line-by-line diff, 2026-06-12).

---

## Docs Map

| File | Purpose |
|---|---|
| `AGENTS.md` | AI agent instructions — commands, constraints, architecture summary |
| `docs/architecture/ARCHITECTURE.md` | Deep-dive reference for models/engineers joining cold |
| `docs/GOALS.md` | The **why** behind every feature |
| `docs/features/FEATURES.md` | Feature matrix (Web ✅/⏳, Android ✅/⏳) |
| `docs/STATUS.md` | **This file** — live state snapshot |
| `docs/guides/MANDATES.md` | Hard constraints (privacy, offline, config-first) |
| `docs/guides/TROUBLESHOOTING.md` | Dev troubleshooting |
| `docs/guides/UI_GUIDE.md` | UI/UX design system reference |
