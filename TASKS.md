# TASKS.md — Open & Unfinished Work

The single backlog file. Everything that was started (or promised via a feature flag) but not finished lives here.
When something ships, move a one-liner to "Recently Shipped" in `docs/STATUS.md` and delete it here.

Items marked **[audited]** were verified against the actual code/build on 2026-07-04 — file paths and line references are exact, fixes are specified so any agent can pick them up cold.

Last groomed: 2026-07-04

---

## P0 — Broken in production (violates the offline-first mandate)

The entire PWA/offline layer is dead on GitHub Pages. Each item below was verified by inspecting the built `out/` directory. They form one cluster: fix together, verify together.

### 0.1 Service worker never registers in production **[audited]**
`src/components/layout/pwa-loader.tsx:10` calls `navigator.serviceWorker.register('/sw.js')`. The site is served under `basePath: '/studio'`, so in production that resolves to `https://atzsta13.github.io/sw.js` → 404 → **no service worker at all** → no offline caching, no update banner, nothing downstream works.
- **Fix**: `import { BASE_PATH } from '@/lib/base-path'` and register `` `${BASE_PATH}/sw.js` `` (scope `` `${BASE_PATH}/` ``).
- Note: the update-prompt infrastructure (`sw-update-banner.tsx`, `use-sw-update.ts`, `SKIP_WAITING` listener in `sw.js:124`) is complete and mounted in `app/layout.tsx` — it has simply never run in prod because of this 404. Fixing registration likely fixes the "stale deploys" complaint for free.
- **Verify**: after deploy, DevTools → Application → Service Workers on `atzsta13.github.io/studio/` shows an active worker; then push any change and confirm the "update available" banner appears.

### 0.2 sw.js precache list is wrong three ways **[audited]**
`public/sw.js` PRECACHE_URLS (lines 4–11):
1. No `/studio` prefix on any path → all precaches 404 in production.
2. `/icons/icon-192x192.png` — there is no `icons/` directory; the real file is `public/icon-192x192.png`.
3. `rock-am-ring-2026` map.svg is missing from the list (5 of 6 festivals listed).
- **Fix**: build URLs relative to `self.registration.scope`, include all 6 festivals, correct the icon path.
- Also delete the dead `/api/weather` handler (sw.js lines ~62–80): this app has **zero API routes**, and the real weather call goes cross-origin to `api.open-meteo.com`, which never matches `url.pathname.startsWith('/api/')`. Either remove the branch or rewrite it to match the open-meteo host if offline weather caching is actually wanted.

### 0.3 PWA manifest broken four ways **[audited]**
Verified in built output: `out/index.html` links `href="/manifest.json"` (no basePath — Next does not auto-prefix `metadata.manifest`), and `out/manifest.json` is Sziget-branded.
1. Manifest link 404s in production (`/manifest.json` instead of `/studio/manifest.json`). Fix in `src/app/layout.tsx:17` using the base path.
2. `scripts/generate-manifest.mjs` generates ONE Sziget manifest for the whole six-festival site (the deploy workflow pins `NEXT_PUBLIC_FESTIVAL_ID: sziget-2026`). Its hardcoded `CONFIGS` map is missing ernte-punk and rock-am-ring and duplicates data that lives in `festivals/*/config.json` (white-label violation).
3. `start_url: '/'` points at the domain root, not `/studio/`.
4. Icons reference `/icon-512x512.png`, which does not exist anywhere in the repo (only 192px exists), and lack the basePath prefix.
- **Decide**: either a neutral "Festival Insider" manifest generated from config (correct for a multi-festival site), or per-festival manifests injected in `[festivalId]/layout.tsx`. Add a real 512px icon either way.

### 0.4 Set-time notifications are silently dead in every browser **[audited]**
`src/lib/notifications.ts:17` gates on `'showTrigger' in Notification.prototype` — the Notification Triggers API was a Chrome origin trial **removed in 2021**; the check is false in every current browser. So `areNotificationsSupported()` always returns false and favoriting an artist in the timetable never schedules anything, silently. (It also references the non-existent `/icons/` paths.)
- **Options**: (a) delete the feature and the dead code path honestly; (b) in-page `setTimeout` + plain `Notification` while the app is open — works, limited; (c) Push API — needs a server, violates the no-backend mandate, rejected.
- Whatever is chosen, correct the "Favoriting + notifications" section of `docs/TIMETABLE.md`, which currently describes this as working.

---

## P1 — Real bugs, verified in code

### 1.1 Sziget timetable data is corrupted — the flagship feature shows wrong days **[audited]**
From `festivals/sziget-2026/data/lineup.json` (measured, not estimated):
- **19 artists** have a `startTime` but no `day` label → completely invisible in the timetable grid (grid requires `day`).
- **11 artists** carry a wrong day label (Appmiral `day-*` tags are unreliable — e.g. artists labeled "Saturday" that actually play Aug 11/12). The "Saturday" tab currently mixes sets from Aug 12, 14, 15 and 16 in one board, and live/past states anchor to the wrong date.
- **Fix**: in `scripts/rebuild-lineup-from-api.mjs`, derive `day` from the `startTime` calendar date with the 06:00 rollover (sets before 06:00 belong to the previous festival day) instead of trusting Appmiral day tags; then `npm run lineup:rebuild:sziget`.
- **Verify** (should print exactly one date per day label, no NONE bucket):
```bash
node -e "const l=require('./festivals/sziget-2026/data/lineup.json');const m={};for(const a of l){if(!a.startTime||a.showInSchedule===false)continue;(m[a.day||'NONE']=m[a.day||'NONE']||new Set()).add(a.startTime.slice(0,10))}for(const[d,s]of Object.entries(m))console.log(d,[...s].sort().join(','))"
```

### 1.2 Favorites bleed between festivals on client-side switch **[audited]**
`src/components/layout/insider-provider.tsx` (~line 102): when `config.id` changes (FestivalSwitcher navigates between festivals; Next.js keeps the same provider instance for a dynamic segment param change), `tieredFavorites` is only overwritten if the *new* festival has saved favorites. If it has none, the previous festival's favorites stay in memory — and the next heart-tap writes **all of them** into the new festival's storage key.
- **Fix**: reset state (`setTieredFavorites({})`, `setLineup([])`, `setConflicts(new Set())`) at the top of the `config.id` effect — or render the provider as `<InsiderProvider key={festivalId}>` in `[festivalId]/layout.tsx` so it remounts per festival.
- **Verify**: favorite artists on Sziget → switch to Frequency via the header dropdown (no hard reload) → Frequency must show 0 favorites, and `localStorage['frequency-2026-favorites-v2']` must stay empty until you favorite something there.

### 1.3 Clash badge shows fractional counts **[audited]**
`src/components/timetable/timetable-view.tsx:389`: `conflicts.size / 2` — with 3 mutually overlapping favorites (a chain), `conflicts` holds 3 IDs → the badge reads "1.5 CLASHES".
- **Fix**: count actual overlap *pairs* (reuse `useClashResolver(...).length`) or reword to "N ARTISTS CLASH" using `conflicts.size`.

### 1.4 Two divergent clash implementations **[audited]**
`insider-provider.tsx` conflict detection (absolute-time overlap, no day check) vs `src/hooks/use-clash-resolver.ts` (requires `a.day === b.day` before comparing). The day check silently drops real overlaps whenever day labels are wrong (see 1.1) and is redundant given full ISO timestamps.
- **Fix**: single shared overlap util (absolute-time compare only); both consumers use it.

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
| `stageCapacity` | ❌ | ❌ | Needs live data → conflicts with offline mandate. Recommend deleting the flag |
| `customThemes` | ❌ | ❌ | Per-user theme selection |
| `familyZone` | ❌ | ❌ | POI filter — small task: poi.json category + map filter |
| `feedbackSystem` | ✅ | ❌ | Web card exists; Android missing |
| `waterCounter` | ✅ | ❌ | Android ToolsScreen card missing |
| `setlistLinks` | ✅ | ❌ | Android ArtistDetailScreen section missing |

---

## P3 — Web UX improvements (component is sound, these are gaps)

- [ ] **Timetable mobile compact mode** — 18 Sziget stages × 200px min column ≈ 3,600px horizontal scroll on a phone. Needs a collapsed single-column / by-time list mode (Android already has a BY-TIME tab; web has nothing).
- [ ] **Auto-select the live day** — `timetable-view.tsx` always opens on day tab 0; during the festival it should open on today.
- [ ] **Timetable tier distinction** — `must_see` vs `interested` favorites render identically in the grid.
- [ ] **Horizontal-scroll affordance** — scrollbar is hidden (`no-scrollbar`); nothing signals more stages to the right.
- [ ] **Cross-day favorites summary** — no "My Schedule" view across all days.
- [ ] **Schedule export** — iCal / share link of favorited sets.
- [ ] **Lineup diff (2025 vs 2026) data gaps** — `lineup_2025.json` missing for Ernte Punk and Rock am Ring; `LineupDiff` silently renders nothing there. Add data or hide the section per festival.

---

## P3 — Dead weight (web) **[audited]**

- [ ] **21 unused ShadCN components** in `src/components/ui/` — zero imports outside the ui folder itself: `alert-dialog`, `alert`, `avatar`, `calendar`, `carousel`, `chart`, `collapsible`, `form`, `label`, `menubar`, `popover`, `radio-group`, `select`, `separator`, `sheet`, `sidebar` (~770 lines), `skeleton`, `slider`, `switch`, `table`, `tooltip`. Keep `toast`/`toaster` (used via `use-toast`). Re-verify each with grep before deleting, then run typecheck + tests + build.
- [ ] **Unused/misplaced dependencies** (`package.json`): `@mui/lab` (0 imports — also remove from `next.config.ts` optimizePackageImports), `react-hook-form` + `@hookform/resolvers` + `zod` (only consumer is the unused `ui/form.tsx`), `react-day-picker` (only unused `ui/calendar.tsx`), `embla-carousel-react` (only unused `ui/carousel.tsx`), `patch-package` (no `patches/` dir exists), `dotenv` (zero imports in src or scripts). Move `puppeteer` to devDependencies (only scrape scripts use it). Delete the dead ui components first, then the deps, then verify: typecheck + tests + full build.
- [ ] **`productionUrl` relics in configs** — 4 festivals point to `*.vercel.app` domains from the pre-GitHub-Pages era; the real site is `atzsta13.github.io/studio`. Android's AI Scout builds its model-download URL from this field (see Android section). Update or remove the field.
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
