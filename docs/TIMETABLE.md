# Timetable Feature — Complete Brief

This document is a full technical and UX brief of the timetable feature, written for a model with no prior context. Read it top to bottom before suggesting changes.

---

## What it is

A pixel-accurate, offline-first festival grid that maps artists to stage columns and minute-resolution time slots. Think a visual TV guide, rotated 90°: time runs top-to-bottom on the Y axis, stages run left-to-right on the X axis.

It is the flagship feature of the app. For Sziget 2026 it renders 442 artists across 18 stages over 7 days.

---

## Stack

- **Web**: Next.js 16 / React 19, fully static export (`output: 'export'`), deployed to GitHub Pages.
- **Styling**: Tailwind CSS for layout/controls, MUI 6 (`Box`, `Typography`, `IconButton`) for artist cards. No server, no API routes.
- **State**: React `useState`/`useMemo`/`useCallback` only. No external state library.
- **Data**: Loaded client-side from `/public/data/<festivalId>/lineup.json` via `useInsider()` hook (`InsiderProvider`). All user state (favorites, progress) is `localStorage`-only, never sent anywhere.

---

## Files

| File | Role |
|---|---|
| `src/app/[festivalId]/timetable/page.tsx` | Route page — mounts provider, handles daypark/nightpark toggle (Frequency only), renders `ClashResolver` + `TimetableView` |
| `src/components/timetable/timetable-view.tsx` | Main grid — day tabs, stage pills, scrollable time board, now-line, FAV filter, jump-to-now |
| `src/components/timetable/artist-card.tsx` | Single slot card — name link, heart toggle, map pin, genre tag |
| `src/components/timetable/clash-resolver.tsx` | Card shown above the grid listing up to 3 overlapping favorites |
| `src/hooks/use-clash-resolver.ts` | Pure hook — O(n²) overlap detection on favorited artists |
| `src/components/layout/insider-provider.tsx` | Global context — lineup data, favorites (tiered), conflicts set, notifications |
| `src/lib/notifications.ts` | Service-worker-based local push notifications for favorited sets |

---

## Data format

Every artist in `lineup.json` that appears in the timetable has:

```json
{
  "id": "105",
  "artist": "Karen Dió",
  "day": "Friday",
  "stage": "Main Stage",
  "startTime": "2026-08-14T16:00:00.000+02:00",
  "endTime": "2026-08-14T17:00:00.000+02:00",
  "showInSchedule": true,
  "genres": ["Rock"]
}
```

**Key invariants:**
- All times are ISO 8601 with explicit UTC offset (`+02:00` = CEST). Never plain `HH:mm`.
- `day` is an Appmiral-internal label (e.g. `"Friday"`), NOT a reliable calendar weekday. Multiple day labels can share the same calendar date. The `config.dates.days` array defines the canonical display order.
- `showInSchedule: false` hides an artist from the grid (they still appear in the artist list). Currently 27 Sziget artists are hidden this way.
- Artists with `null` startTime/endTime are excluded from the grid entirely.

**Sziget 2026 coverage:** 458 total artists, 442 have times, 431 are `showInSchedule: true`, across 18 stages, Aug 9–16.

---

## Layout mechanics

```
┌─────────────────────────────────────────────────────────┐
│ [SUN] [MON] [TUE] [WED] [THU] [FRI] [SAT]   [NOW] [❤ 3]│  sticky day tabs + controls
├─────────────────────────────────────────────────────────┤
│ [MAIN STAGE] [BOLT] [LE DÔME] [REVOLUT] ...             │  scrollable stage pills (18 stages)
├──────────────────────────────────────────────────────────┤
│       │ MAIN STAGE │ ARZENÁL │ BOLT NIGHT │ ...          │  sticky stage header (inside scroll)
│ 13:00 ├────────────┼─────────┼────────────┤              │
│       │            │         │            │              │
│ 14:00 │  ARTIST A  │         │  ARTIST B  │              │  artist cards, abs-positioned
│       │  14:00     │         │  14:30     │              │  height = duration * PX_PER_MIN
│ 15:00 │            │         │            │              │
│ ━━━━━ NOW LINE ━━━━━━━━━━━━━━━━━━━━━━━━━━ │              │  red line on live day
│ 15:30 │  ARTIST C  │         │            │              │
└──────────────────────────────────────────────────────────┘
```

**Constants:**
- `PX_PER_MIN = 2.4` — 1 minute = 2.4px. A 60-min set = 144px tall.
- `GUTTER_PX = 52` — width of the left time gutter.
- `MIN_COL_PX = 200` — minimum stage column width; columns expand to fill.
- `ROLLOVER_HOUR = 6` — sets ending before 06:00 are treated as same festival "day" (e.g. a set at 02:00 is after midnight but belongs to the previous festival day).

**Time math:**  
All pixel positions are derived from `wallMinutes(iso)` which reads hours and minutes directly from the ISO string characters WITHOUT parsing to a JS `Date`. This prevents timezone drift when the viewer's local timezone differs from the festival's:

```ts
function wallMinutes(iso: string): number {
  const h = parseInt(iso.slice(11, 13), 10);
  const m = parseInt(iso.slice(14, 16), 10);
  const total = h * 60 + m;
  return h < ROLLOVER_HOUR ? total + 24 * 60 : total;
}
```

---

## Features implemented

### Day tabs
- Derived from the `day` field of scheduled artists.
- Sorted by `config.dates.days` array order (the festival's canonical day sequence), falling back to first-startTime sort for any day not in the config.
- Tab labels come from `config.dates.dayLabels` map.
- Resetting hidden stages when switching days.

### Stage filter pills
- One pill per stage present on the active day (up to 18 for Sziget).
- Clicking a pill toggles it hidden: the column disappears from the grid and the pill gets a strikethrough style.
- Pills reset to all-visible on day change.
- Only rendered when `allStages.length > 1`.

### Favorites filter (FAV button)
- Shows current favorited-artist count for the active day.
- When active: filters `dailyLineup` to only favorited artists. Unfavorited artists' cards disappear; their stage columns remain.
- When active with zero favorites on the day: shows a clean empty state ("NO FAVOURITES ON THIS DAY / Tap the heart on any artist to add them") instead of the grid.
- Button turns primary-color with filled heart when active.

### Artist search
- Text input in the sticky header filters the active day's cards by artist name (case-insensitive substring).
- Non-matching cards are removed; stage columns remain. Clear (✕) button resets it.
- When a query matches nothing on the day, a clean empty state is shown instead of the grid.

### Live + past set states
- When the active day is live (viewer local date == venue date, incl. overnight rollover), each card derives `isLive` / `isPast` from `nowWallMinutes`.
- **Live** cards get a green left border, green glow ring, green time text, and a pulsing "● NOW" badge.
- **Past** cards are dimmed to 40% opacity (favorited and clashing cards stay full opacity so they're never lost).
- All computed from `wallMinutes` (no Date parse) so it never drifts with viewer timezone.

### Set time range
- Every non-tiny card shows `start–end` (e.g. `16:00–17:00`), not just the start time, so set length is readable without measuring pixel height.

### Jump to now (NOW button)
- Only rendered when the viewer's local date matches the active festival day (i.e., they are at the festival right now).
- Clicking smooth-scrolls the inner scroll container to 160px above the now-line.
- Styled as a red destructive-color pill matching the now-line.

### Now-line
- A 2px red line with glow, absolutely positioned at the current minute within the time board.
- Updates every 60 seconds via `setInterval`.
- Only shown when local date matches the festival day (handles overnight rollover before 06:00).
- On day-tab change, the scroll container auto-jumps to the now-line if the day is live.

### Clash detection
- Computed in `InsiderProvider` globally (not per-page) via O(n²) pairwise check on all favorited artists with times.
- Result is a `Set<string>` of artist IDs that overlap with at least one other favorite.
- `ClashResolver` component renders above the grid — shows up to 3 clashing pairs with a lightning bolt icon.
- In the grid, conflicting artist cards get a red left border, red glow box-shadow, and red text.
- A floating badge at the bottom of the screen shows total clash count.

### Artist cards
- Clicking the **artist name** navigates to `/<festivalId>/artist/<id>/` (Next.js Link).
- Clicking the **heart area** toggles favorite (does not navigate).
- Map pin icon (only on sets ≥ 40 min) links to `/map?stage=<name>`.
- Bottom genre tag (only on sets ≥ 40 min) shown in festival accent color if favorited.
- **Tiny sets** (< 25 min): compact layout, no time subtitle, smaller font, no map pin.
- **Small sets** (25–40 min): name + time shown, no genre tag, no map pin.
- **Normal sets** (≥ 40 min): full card with name, time, genre, map pin.

### Favoriting + notifications
- Two tiers: `must_see` and `interested` (default is `interested` when tapping the heart in the timetable).
- Stored in `localStorage` as `${festivalId}-favorites-v2`, keyed by artist ID.
- ⚠️ **Local notifications were removed** — The local PWA Notification Triggers API (`showTrigger`) is no longer supported by current browsers, making local timetabled notifications impossible without a backend push notification system. The dead code path was removed to keep the app clean.

---

## Config integration

All festival-specific values come from `config.json` (never hardcoded):

```ts
config.dates.days          // canonical day order array e.g. ["Sunday","Monday",...]
config.dates.dayLabels     // day → abbreviation map e.g. {"Sunday":"SUN"}
config.dates.openingDayFilter  // which day's artists to show as "opening acts" on home page
config.dates.startDate     // displayed on home page e.g. "2026-08-09"
config.dates.endDate       // displayed on home page e.g. "2026-08-16"
config.dates.utcOffsetHours // used for now-line calculations
config.features.timetable  // boolean gate — false hides the entire timetable feature
config.features.clashResolver  // boolean gate — false hides ClashResolver
config.features.dayparkNightpark  // boolean gate — adds day/nightpark toggle (Frequency only)
config.theme.primaryHex    // used for favorite highlight color
config.theme.secondaryHex  // used for genre tag color
config.theme.backgroundHex // used for card background
config.theme.glowColor     // used for favorite glow shadow
```

---

## Known issues / rough edges

1. **Sziget day labels are corrupted — grid shows wrong days** (audited 2026-07-04, supersedes the earlier "this is correct behavior" claim): 19 artists have a `startTime` but no `day` → invisible in the grid; 11 artists carry a wrong day label, so e.g. the "Saturday" tab mixes sets from Aug 12/14/15/16 in one board and live/past states anchor to the wrong date. Fix is data-side: derive `day` from the startTime date with 06:00 rollover. Full spec: `TASKS.md` P1.1.

2. **Playwright click in inner scroll container** — Artist card links require `el.evaluate(el => el.click())` in Playwright tests because the scroll container is a `div` with `overflow-auto`, not `window`. Standard `page.locator().click()` doesn't scroll the inner container to the element first.

3. **Service worker dead in production too** — audited 2026-07-04: `pwa-loader.tsx` registers `/sw.js` without the `/studio` basePath, so the SW never registers on GitHub Pages at all (offline caching and the existing update banner never run). Full diagnosis and fix: `TASKS.md` P0.1–0.3.

4. **Tiered favorites not surfaced in timetable** — The `must_see` / `interested` tiers exist in the data model and provider, but the timetable grid treats all favorites identically (same border color, same glow). There is no visual distinction between tiers in the grid.

5. **Clash detection uses JS Date parsing** — Unlike `wallMinutes()`, the clash resolver parses startTime/endTime via `new Date()`. This is fine because clash detection only needs relative ordering (does A overlap B?), not absolute pixel position. But it's inconsistent with the rest of the time math.

6. **No horizontal scroll indicator** — On days with 15+ stages, the grid scrolls horizontally but there's no visual affordance (scrollbar is hidden via `no-scrollbar`).

7. **Stage column min-width is fixed at 200px** — On mobile with 15 stages, this means ~3000px of horizontal scroll. No responsive collapse or "compact mode" exists.

---

## What does NOT exist yet (potential improvements)

- **Compact/mobile mode** — collapse multiple stages into a single scrollable list when screen is narrow, rather than forcing horizontal scroll.
- **Visual tier distinction** — `must_see` cards could have a different color border or star icon vs `interested`.
- **"My Schedule" export** — generate an iCal / share link of favorited sets.
- **Cross-day favorites summary** — a view that shows all your favorites across all days at once (currently you must browse each day tab).
- **Pinch-to-zoom on mobile** — PX_PER_MIN is fixed; there's no way to zoom out to see the full day at once.
- **Offline indicator** — no visual feedback that the timetable is running from cached data vs live.
- **Now-line for other festivals** — NOW button only works when viewer's local time matches the festival day. International viewers or those in different timezones won't see it correctly unless they're physically at the festival.

---

## Android parity

The Android `ScheduleScreen.kt` grid mirrors the web feature set:
- **Live + past states** — `isNowPlaying()` drives a green border, glow, pulsing dot and "LIVE NOW" badge; finished sets dim to 45% (favorites / squad / live stay full). Past detection uses the grid's `nowMinutes` (wall-clock, rollover-aware).
- **Set time range** — grid blocks show `start - end`.
- **Artist search** — `searchQuery` in `ScheduleUiState` filters `dayArtists` by name (case-insensitive); the field shows on the GRID and BY-TIME tabs with a clear button, and both tabs show a "NO ARTISTS MATCH" empty state.

Android additionally has GRID / BY-TIME / MY-LINEUP tabs, a tiered clash banner (HARD vs TIGHT transition), and squad QR sharing — none of which exist on web.

## Festival coverage

| Festival | `features.timetable` | Artists with times | Stages | Date range |
|---|---|---|---|---|
| Sziget 2026 | `true` | 442 / 458 | 18 | Aug 9–16 |
| Nova Rock 2026 | `true` | 84 / 84 | multiple | Jun 11–14 (past) |
| Rock am Ring 2026 | `true` | 73 / 73 | multiple | Jun 5–7 (past) |
| Area 53 2026 | `true` | 30 / 30 | multiple | Jul 15–18 |
| Frequency 2026 | `false` | 0 | — | TBA |
| Ernte Punk 2026 | `false` | 0 | — | TBA |
