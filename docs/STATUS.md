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
| Area 53 2026 | 30 | ⚠️ 30/30 | ✅ | **Inconsistent format**: times are plain strings (`"22:30"`) not ISO 8601. Timetable screen and clash resolver will NOT work correctly until migrated to ISO format. |
| Frequency 2026 | 95 | ❌ TBA | ❌ | No schedule yet. |
| Ernte Punk 2026 | 17 | ❌ TBA | ❌ | No schedule yet. |

---

## Open Issues

### Critical

None currently.

### Data

**Area 53 time format is wrong.**
`startTime`/`endTime` are plain strings (`"22:30"`, `"00:00"`) instead of ISO 8601 (`"2026-07-10T22:30:00+02:00"`). The timetable component expects ISO. The clash resolver and set countdowns will not work for Area 53 until this is fixed.
→ Fix: run a migration script similar to the Nova Rock timetable update, converting each time to a full ISO timestamp with the correct Area 53 date and timezone.

**Nova Rock 5 artists without slots.**
Slipknot, Electric Callboy, Wanda, Static X, Badflower were not present on the live timetable page. They may have been cancelled or replaced. They remain in the lineup with null times and will not appear in the timetable view.

**Sziget stages without times.**
292 Sziget artists have a `stage` field set but `startTime: null`. This is correct — Sziget has not published its timetable — but means the timetable feature flag (`timetable: false` in Sziget's config) must stay off until data is available.

### Android

**SharedPreferences unencrypted.**
Festival selection ID and any persisted user data (favorites via Room) is stored in unencrypted SharedPreferences/SQLite. Acceptable for MVP; for a production release, migrate to `EncryptedSharedPreferences` and encrypted SQLite.

**`FestivalSelectionScreen` navigation after switch.**
`FestivalConfig.switchFestival()` restarts the app via `getLaunchIntentForPackage`. This works but is abrupt — no transition animation and the system treats it as a new launch. Acceptable for now.

### Web

**No service worker update prompt.**
When a new deploy is pushed, users on the PWA won't be prompted to refresh. They silently get stale cached data until they manually reload.

**`chart.tsx` TypeScript errors (4 errors, pre-existing).**
ShadCN recharts wrapper has type mismatches with the recharts library version. These do not affect runtime behavior. Filed as a known ShadCN/recharts incompatibility.

**Troubleshooting guide is stale.**
`docs/guides/TROUBLESHOOTING.md` (last updated 2026-03-20) references the old asset path (`android/app/src/main/assets/lineup.json`) which no longer exists after the single-APK refactor. Old Android Gradle commands also reference flavors. Needs a rewrite.

### Features blocked on schedule data

These features are implemented but show nothing meaningful for festivals with null schedules:

| Feature | Blocked for | Unblocked for |
|---|---|---|
| `clashResolver` | Sziget, Frequency, Ernte Punk, Area 53* | Nova Rock, Rock am Ring |
| `setCountdowns` | Sziget, Frequency, Ernte Punk, Area 53* | Nova Rock, Rock am Ring |
| `vibeOfTheHour` | Sziget, Frequency, Ernte Punk, Area 53* | Nova Rock, Rock am Ring |
| `groupSchedules` | All (feature pending) | — |

*Area 53 has times but in wrong format — fix required first.

---

## Recently Shipped

| Date | What |
|---|---|
| 2026-06-12 | Nova Rock full timetable (84 artists, live data from novarock.at) |
| 2026-06-12 | Single-APK Android refactor + FestivalSwitcher on web |
| 2026-06-12 | ARCHITECTURE.md full rewrite for AI/cold-start readability |
| 2026-06-10 | Android toolchain Jun 2026 + Coil 3 migration |
| 2026-06-09 | Rock am Ring Android flavor + timetable timezone fix |
| 2026-06-08 | Rock am Ring 2026 added (73 artists, full timetable) |

---

## Pending / Next Up

These are real gaps, not backlog filler:

1. **Fix Area 53 time format** — convert plain `HH:MM` strings to ISO 8601. Quick script job.
2. **Rewrite `TROUBLESHOOTING.md`** — outdated paths and commands.
3. **Frequency + Ernte Punk timetable** — when published. Run `npm run lineup:update:frequency` / `npm run lineup:update:ernte-punk`.
4. **Sziget timetable** — highest impact when published (339 artists). Unlocks clash resolver and set countdowns for the main festival.
5. **Service worker update prompt** — users on PWA get stale deploys silently.
6. **Area 53 config audit** — check if `timetable: true` in `area53-2026/config.json` and if so, disable it until times are in ISO format.

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
| `docs/guides/TROUBLESHOOTING.md` | Dev troubleshooting — currently stale |
| `docs/guides/UI_GUIDE.md` | UI/UX design system reference |
