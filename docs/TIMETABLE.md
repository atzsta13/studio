# Timetable Feature — Complete Brief

This document is a full technical and UX brief of the timetable feature, written for a model with no prior context. Read it top to bottom before suggesting changes.

---

## What it is

A pixel-accurate, offline-first festival grid that maps artists to stage columns and minute-resolution time slots. Think a visual TV guide, rotated 90°: time runs top-to-bottom on the Y axis, stages run left-to-right on the X axis.

It is the flagship feature of the app. For Sziget 2026 it draws 403 sets across 18 stages over 7 days — of 451 artists, 431 have times and 27 of those are held back by `showInSchedule: false`.

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
| `src/components/timetable/artist-card.tsx` | Single slot card — name link, heart toggle, map pin, genre tag. Density comes from `pxHeight`/`pxWidth` |
| `src/components/timetable/timetable-list.tsx` | LIST mode — the day as one time-ordered column |
| `src/components/timetable/clash-resolver.tsx` | Card shown above the grid listing up to 3 overlapping favorites |
| `src/hooks/use-clash-resolver.ts` | Pure hook — O(n²) overlap detection on favorited artists |
| `src/hooks/use-timetable-zoom.ts` | Zoom scale + persistence, and the pure math: `clampZoom`, `anchoredScroll`, `fitZoom`, `fitWidthZoom`, `densityTier` |
| `src/hooks/use-timetable-gestures.ts` | Pinch / ctrl+wheel / double-tap zoom and mouse drag-to-pan, wired to the scroll container |
| `src/hooks/use-timetable-viewport.ts` | Owns the layout invariants below: toolbar measurement, board `max-height`, sticky-header offset |
| `src/lib/festival-time.ts` | `wallMinutes` / `formatMinutes` / `ROLLOVER_HOUR` — the day's wall-clock math, and when *not* to use it |
| `src/components/timetable/pill-button.tsx` | The one pill control: day tabs, NOW, GRID/LIST, FAV, FIT, stage filters |
| `src/components/timetable/zoom-cluster.tsx` | On-screen `− % + FIT` group |
| `src/components/layout/insider-provider.tsx` | Global context — lineup data, favorites (tiered), conflicts set |

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

**Sziget 2026 coverage:** 451 total artists, 431 have times, 424 are `showInSchedule: true`, across 18 stages, Aug 9–16.

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

**Constants** (all in `use-timetable-zoom.ts` unless noted):
- `BASE_PX_PER_MIN = 2.4` — 1 minute = 2.4px at 100% zoom. A 60-min set = 144px tall.
- `BASE_COL_PX = 200` — stage column width at 100% zoom.
- `GUTTER_PX = 52` — width of the left time gutter. Does **not** scale with zoom: it stays pinned and legible.
- `MIN_ZOOM = 0.1`, `MAX_ZOOM = 2.6`, `ZOOM_STEP = 1.3`.
- `ROLLOVER_HOUR = 6` (in `timetable-view.tsx`) — sets ending before 06:00 are treated as same festival "day" (e.g. a set at 02:00 is after midnight but belongs to the previous festival day).

The rendered scale is `pxPerMin = BASE_PX_PER_MIN * zoom` and `colWidth = BASE_COL_PX * zoom`, except that columns stretch to fill the container when the scaled total would be narrower than the viewport (so a 3-stage festival never renders as a thin strip on a desktop).

**Layout invariants (easy to regress).** `use-timetable-viewport.ts` owns these. Three separate things must agree, or the board's own sticky stage header disappears behind the toolbar:
1. The toolbar pins under the *global site header* (`h-14` / `md:h-18` in `header.tsx`) — hence `topInset` = 56 / 72.
2. The board's `max-height` is `100dvh − topInset − toolbarHeight − bottomInset` (`bottomInset` = 76 below MUI `md` for the fixed bottom nav, else 16). The toolbar is measured with a `ResizeObserver` because its height changes with the stage-pill row.
3. The timetable page root must **not** be `min-h-screen` (neither the component root nor the page `Box`). Any page height beyond toolbar + capped board is scroll slack, and page scroll then drags the top of the board — including its sticky header — up behind the toolbar.

Even with all three right, layout padding elsewhere can leave a few pixels of slack, so the stage header's sticky `top` is set to the measured toolbar/board overlap (`stickyHeaderTop`, recomputed on scroll via `requestAnimationFrame`) rather than to `0`. That is belt-and-braces on purpose: it makes the header robust to whatever the page above the grid does.

**Scroll structure.** The board is a flex row: a `position: sticky; left: 0` gutter column holding the hour labels, then the stage area. The stage header row is `position: sticky; top: 0` and its first cell is *also* sticky-left, so the corner survives scrolling on both axes simultaneously. Both axes live in one `overflow: auto` container — there is no nested scroller and no transform, so hit-testing and the browser's own scroll physics stay intact.

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

### Zoom + pan (all axes at once)

The grid is continuously zoomable from 10% to 260% while scrolling freely in both directions.

| Input | Effect |
|---|---|
| Two-finger pinch | Zoom, anchored on the pinch midpoint |
| ctrl/⌘ + wheel (this is also how a trackpad pinch arrives) | Zoom, anchored on the cursor |
| Double-tap / double-click (alt = out) | One `ZOOM_STEP` in or out, anchored |
| `+` / `-` / `0` / `f` keys | In / out / reset to 100% / fit whole day. Ignored while the search field has focus |
| On-screen `−  %  +  FIT` cluster | Same, for touch users who don't guess gestures |
| Mouse drag on the grid background | Diagonal pan in one gesture. Drags starting on a card are ignored (`data-no-pan`) |
| One-finger swipe | Native scroll, untouched |

**Anchored zoom.** `anchoredScroll()` computes the scroll offsets that keep the content under the focal point in place. The DOM only reflects the new scale after React commits, so the target offsets are staged in a ref and applied in a `useLayoutEffect` keyed on `zoom` — never in the event handler.

**Fit.** `fitZoom()` picks the smaller of the width-fit and height-fit. It measures against the container's *computed `max-height`*, not its `clientHeight`: the container is height-capped rather than height-fixed, so once zoomed out its `clientHeight` follows the content and fitting against it would ratchet the zoom down on every press. An axis that cannot be measured yet (container not laid out) is excluded, and if neither can be measured the zoom is left alone.

**Auto-fit.** Until the user zooms deliberately (`userZoomedRef`), the grid re-fits its width on mount and on every day change, so an 18-stage Sziget day is never dumped on a phone at 100%. The automatic fit uses `setZoomTransient`, which does **not** write to storage — otherwise a fitted default would come back as a preference the user never chose.

**Persistence.** `${festivalId}-timetable-zoom` in `localStorage`. Per festival, so Sziget's 18-stage density doesn't follow you to Nova Rock's 3.

**Density from pixels, not duration.** `densityTier(pxHeight)` decides the card layout (`tiny` < 46px, `small` < 78px, `full`), and `pxWidth` drops the map pin, the genre tag and the time range when a column is under 130px. Under ~46px wide (or ~13px tall) the card renders as a bare colour-coded block — favorite / live / clash colours still read, and it stays a labelled link to the artist page. That is what makes a whole festival day legible on one phone screen.

### GRID / LIST toggle

`LIST` renders the day as a single time-ordered column (sets grouped under their start time, each labelled with its stage) for people who read a festival day as a running order rather than a map. The zoom cluster is hidden in list mode and the gestures are detached.

Phones used to be force-switched to LIST on mount because the fixed-scale grid was unusable at 390px. That auto-switch is gone as of 2026-07-26 — the grid now fits itself to the viewport, so GRID is the default on every screen size and LIST is one tap away.

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

Audited 2026-07-26 — the earlier list was almost entirely stale and has been cut to what is still true.

1. **Clash detection deliberately does *not* use `wallMinutes()`.** `areSlotsOverlapping` (`lib/utils.ts`) compares absolute instants via `new Date()`, because favorites span the whole festival: two acts at 22:00 on different days share a wall-minute but do not clash. Do not "unify" this with the grid's wall-clock math — that would turn every same-hour pair across days into a false clash. `lib/festival-time.ts` says the same thing at the source.

2. **Now-line assumes you are at the festival.** The NOW button only lines up when the viewer's local time matches the festival day. International viewers in other timezones won't see it correctly.

3. **No offline indicator.** Nothing tells the user whether the timetable is running from cached data.

4. **Android pinch is not runtime-verified.** Everything else on Android was driven on an emulator (fit, +/−, FIT, pan clamping, persistence across a cold start), but `adb` cannot synthesise a two-finger gesture, so the pinch branch itself has only been exercised through the shared `zoomTo()` path its buttons use.

Fixed and removed from this list: no pinch-to-zoom (shipped 2026-07-26 — see the Zoom + pan section), corrupted Sziget day labels (data rebuilt; every scheduled act now has a `day` consistent with the 06:00 rollover), the service worker not registering under `basePath`, missing `must_see`/`interested` tier styling, the absent horizontal-scroll affordance, and the lack of a mobile compact mode. The Playwright note went too — this project has no Playwright suite.

---

## What does NOT exist yet (potential improvements)

- **"My Schedule" export** — generate an iCal / share link of favorited sets.
- **Cross-day favorites summary** — a view showing all favorites across all days at once (today you must browse each day tab).

---

## Android parity

The Android `ScheduleScreen.kt` grid mirrors the web feature set:
- **Live + past states** — `isNowPlaying()` drives a green border, glow, pulsing dot and "LIVE NOW" badge; finished sets dim to 45% (favorites / squad / live stay full). Past detection uses the grid's `nowMinutes` (wall-clock, rollover-aware).
- **Set time range** — grid blocks show `start - end`.
- **Artist search** — `searchQuery` in `ScheduleUiState` filters `dayArtists` by name (case-insensitive); the field shows on the GRID and BY-TIME tabs with a clear button, and both tabs show a "NO ARTISTS MATCH" empty state.

Android additionally has GRID / BY-TIME / MY-LINEUP tabs, a tiered clash banner (HARD vs TIGHT transition), and squad QR sharing — none of which exist on web.

**Zoom + 2D pan exist on both platforms** (Android since 2026-07-26). The shared math lives in two mirrored files — `src/hooks/use-timetable-zoom.ts` and `android/.../ui/schedule/TimetableZoom.kt` — with the same constants, the same `anchoredScroll` formula, the same density thresholds and the same 10%/260% bounds, each unit-tested on its own platform. Keep them in step: a change to one is a change to both.

Android differences worth knowing:
- **Pan is Compose scroll state, not offsets.** `verticalScroll` + `horizontalScroll`, with the stage header sharing the board's `hScroll` (`enabled = false`) so it tracks the columns. This replaced a hand-rolled `detectTransformGestures` + manual offset/clamp implementation that mutated state during composition and rendered empty columns when zoomed in; scroll state brings correct clamping, fling and overscroll for free.
- **Pinch only from the gesture detector.** `awaitEachGesture` consumes events *only* while two or more pointers are down, so single-finger pan still reaches the scroll modifiers.
- **Anchoring** works as described above; the "apply after the new layout" step is `withFrameNanos { }` instead of `useLayoutEffect`.
- No keyboard shortcuts, no double-tap (a parent double-tap detector would fight the cards' `clickable`), and the board reserves 76dp for the fixed bottom nav.

## Festival coverage

| Festival | `features.timetable` | Artists with times | Stages | Date range |
|---|---|---|---|---|
| Sziget 2026 | `true` | 431 / 451 | 18 | Aug 9–16 |
| Nova Rock 2026 | `true` | 84 / 84 | 3 | Jun 11–14 (past) |
| Rock am Ring 2026 | `true` | 73 / 73 | 3 | Jun 5–7 (past) |
| Area 53 2026 | `true` | 32 / 32 | 2 | Jul 15–18 (past) |
| Frequency 2026 | `true` | 82 / 82 | 5 | Aug 20–22 |
| Ernte Punk 2026 | `false` | 0 / 17 | — | TBA |
