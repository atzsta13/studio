# fix.md — Verification Brief

> All findings from the 2026-06-12 audit were applied in commit `7d810c1`
> ("fix: unify schedule time format (ISO 8601) + audit fixes across web and Android").
> Your job: **verify** each fix below is correct and complete. Don't re-apply anything;
> report discrepancies. Read `AGENTS.md` first for hard constraints.
>
> Automated checks already passing at commit time: `npm run typecheck`, `npm run lint`,
> `npm test -- --run` (189), `npm run build`, `./gradlew compileDebugKotlin`,
> `./gradlew test` (121, includes new FestivalConfigSchemaTest). Re-run them.

---

## P0-1 · Unified time format — ISO 8601 with offset is now canonical

**What was done:**
- `scripts/migrate-area53-times.mjs` (kept in repo) rewrote `festivals/area53-2026/data/lineup.json`: all 30 artists converted from `"HH:mm"` to `"<date>THH:mm:00+02:00"`.
  - Day→date mapping from `config.json` (`dates.startDate` 2026-07-16, days Thu/Fri/Sat).
  - The lineup contains a **Wednesday** warm-up act not in `dates.days` — mapped to startDate − 1 (2026-07-15).
  - Past-midnight rule: `endTime <= startTime` rolls endTime to the next date. No startTimes were in the small hours, so no start rollover was needed.
- Android now parses ISO with HH:mm fallback via **shared** helpers in `ui/utils/FestivalUtils.kt`: public `parseTime(String?): LocalTime?` and `formatTime(String?): String`.
  - Private `parseTime` copies deleted from `ScheduleScreen.kt` and `ScheduleViewModel.kt`; both import the shared one.
  - `hasSetStarted` in FestivalUtils uses `parseTime` now.
- Sorting: `ScheduleViewModel.kt` no longer sorts by raw string with `?: "99:99"`; both sort sites use `.thenBy(nullsLast()) { parseTime(it.startTime) }`, and `detectClashes` sorts with `compareBy(nullsLast()) { parseTime(it.startTime) }`.

**Verify:**
- [ ] Spot-check migrated data: `a53-2026-th-1` = `2026-07-16T22:30:00+02:00` → `2026-07-17T00:00:00+02:00`; aftershows end at 02:00 next date; Wednesday show dated 2026-07-15.
- [ ] No `"HH:mm"`-only times remain in any `lineup.json` (festivals/, public/data/, android assets).
- [ ] `grep -rn "ofPattern(\"HH:mm\")" android/app/src/main` — only inside FestivalUtils parse/format helpers.

### Extra fix not in original audit
`ScheduleScreen.kt` `getX()` split the time string on `:` and called `.toInt()` — with ISO data this threw `NumberFormatException` (crash on the grid view). Changed to `getX(time: LocalTime?)`; call sites pass `parseTime(artist.startTime)` and the now-line passes `LocalTime.now()` directly.
- [ ] Verify the grid x-positioning logic is still equivalent (hour < 10 normalizes +24, offset from START_HOUR).

## P0-2 · Android UI renders HH:mm, not raw timestamps

`formatTime()` applied at: ScheduleScreen lines (timeline label, by-time list start/end, clash sheet "DAY · start - end"), `ArtistDetailScreen.kt` badge, `ArtistCard.kt` share text.
- [ ] `grep -n 'artist.startTime\|a.startTime' android/app/src/main/java/.../ui/` — remaining hits should be null-checks or parseTime inputs only, never direct Text/string rendering.

## P0-3 · utcOffsetHours added

`"utcOffsetHours": 2` added under `location` in 5 configs (sziget, novarock, frequency, area53, ernte-punk); rock-am-ring already had it. TS interface already declared `utcOffsetHours?: number`.
- [ ] All 6 configs in `festivals/`, `public/data/`, and `android/app/src/main/assets/` carry the field and match each other.

## P0-4 · Phantom timetable cards

`src/components/timetable/timetable-view.tsx` `dailyLineup` now filters `item.day === activeDay && item.startTime && item.endTime && item.stage`. The `getGridRow` null fallback kept as a guard.
- [ ] Confirm Nova Rock's Slipknot/Electric Callboy/Wanda (day+stage, null times) can't render in the grid.

## P1-1 · switchFestival process kill

`FestivalConfig.kt switchFestival()`: pref write uses `.commit()`, then launch intent, then `finishAffinity()` (if Activity) + `Process.killProcess(myPid())`. The `_current = load(...)` and `AppDatabase.resetInstance()` calls were **removed** (unreachable after kill).
- [ ] Confirm nothing else relied on `resetInstance()` being called here.

## P1-2 · Crash-handler loop guard

`MainActivity.kt`: handler stores `last_crash` timestamp in `crash_guard` prefs (`.commit()`); relaunches only if previous crash > 10 s ago; always `finish()` + kill.

## P1-3 · Config load fail-fast

`FestivalConfig.initialize()` falls back to `DEFAULT_FESTIVAL_ID`, then `error(...)` with clear message. `load()` made `internal` (used by FestivalSelectionScreen). New unit test `data/config/FestivalConfigSchemaTest.kt` parses all 6 bundled config.json files.
- [ ] Note: `switchFestival()` no longer loads the config at all (process restarts → initialize handles it). Confirm that's sound.

## P1-4 · syncLineup deleted

Removed from `LineupRepository.kt` along with `java.net.URL` import. There were zero call sites. `ILineupRepository` never declared it.
- [ ] Confirm no UI "refresh" button references it (the `toolkit_refresh` i18n strings still exist — check what they trigger, if anything).

## P2-1 · timetable feature flags

`features.timetable: false` for sziget-2026, frequency-2026, ernte-punk-2026. True stays for novarock, area53, rock-am-ring.

## P2-2 · Asset sync — root cause fixed

**Finding beyond the audit:** `scripts/sync-data.mjs` never copied anything to Android assets (AGENTS.md claimed it did). Added a step copying `config.json` + `data/*.json` to `android/app/src/main/assets/<id>/` for every festival. All three copies verified byte-identical for all 6 festivals at commit time.
- [ ] Re-run `npm run lineup:sync`; `git status` should stay clean.

## P2-3 · Config-first violations

1. `FestivalSelectionScreen.kt`: hardcoded `FESTIVALS` list deleted; builds entries from `FestivalConfig.AVAILABLE_IDS` + `FestivalConfig.load()` (`config.name`, `"${city}, ${country}"`) inside `remember {}`. The identical-branch `if (isSwitch)` collapsed. (The old hardcoded list had wrong locations for Area 53 and Ernte Punk.)
2. `timetable-view.tsx`: pink-600/pink-500/bg-black replaced with `bg-primary`/`text-primary`/`bg-background`/`text-primary-foreground`. Note: `border-white/10`, `text-white/…` opacity utilities were left as-is — judgement call; flag if you disagree.

## P2-4 · NOT DONE — needs maintainer decision

The 5 slotless Nova Rock artists (Slipknot, Electric Callboy, Wanda, Static X, Badflower) are unchanged. Options: remove, or add `cancelled: true` + badge. Tracked in `docs/STATUS.md` "Pending / Next Up". **Do not silently delete.**

## Docs

`docs/STATUS.md` updated: Area 53 marked migrated, ISO 8601 declared canonical format, feature-blocked table updated, Pending list refreshed.

---

## Verification commands

```bash
npm run typecheck && npm run lint && npm test -- --run && npm run build
npm run lineup:sync && git status --short   # must be clean
cd android && ./gradlew compileDebugKotlin && ./gradlew test
```

Manual smoke (same as original audit):
1. Web `/novarock-2026/timetable/` — CEST gutter labels, no header-row phantom cards.
2. Web `/area53-2026/timetable/` — grid renders, no NaN countdowns.
3. Android — Nova Rock schedule shows HH:mm; festival switch loops without crash-flash.
