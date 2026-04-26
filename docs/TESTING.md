# Testing Guide — Festival Insider Platform

## Quick Start

```bash
npm test              # watch mode (development)
npm test -- --run     # single pass (CI)
npm test -- --coverage  # with coverage report
npm test -- use-vibe-quiz  # run one file
```

Android unit tests (no device required):
```bash
cd android && ./gradlew test
```

---

## What We Test

### Web — 198 tests across 17 files (`src/test/`)

| File | Subject | Tests |
|---|---|---|
| `festival-config.test.ts` | `getFestivalConfig`, `FESTIVAL_IDS`, all-festival shape validation | 10 |
| `use-translation.test.ts` | `useTranslation` key passthrough, locale fallback | 5 |
| `use-favorites.test.ts` | `localStorage` v1→v2 migration, tier storage, cross-festival isolation | 8 |
| `use-clash-resolver.test.ts` | Overlap detection, adjacency, null guards, multi-clash, midnight crossover | 12 |
| `use-vibe-quiz.test.ts` | State transitions, genre cap, scoring algorithm, reset, energy/vibe targeting | 26 |
| `use-festival-storage.test.ts` | Key namespacing, functional updater, remove, malformed JSON fallback | 11 |
| `use-lineup-diff.test.ts` | newArrivals, returningHeroes, genreShifts (positive/negative/cap), fetch mock | 18 |
| `use-hydration.test.ts` | localStorage restore, addWater, resetWater, festival isolation | 11 |
| `use-haptic.test.ts` | Vibration patterns (20/30/40ms, burst), graceful no-op when API absent | 13 |
| `use-toast.test.ts` | Reducer state machine: ADD/UPDATE/DISMISS/REMOVE, TOAST_LIMIT=1 | 16 |
| `serendipity.test.ts` | Pool selection tiers, recentlySpunIds mutation, fallback logic | 11 |
| `rate-limit.test.ts` | Per-key independence, window expiry, sequential increment | 8 |
| `festival-env.test.ts` | `getAndroidSlug` (all 5 festivals), `getFestivalId` env override, path structure | 14 |
| `error-boundary.test.tsx` | Renders children; catches throws; reset button; no-message edge case | 7 |
| `offline-banner.test.tsx` | Hidden when online, visible when offline, z-index | 7 |
| `favorite-button.test.tsx` | Toggle callback, tier argument, seen-state localStorage, aria | 9 |
| `quiz-option-card.test.tsx` | Label render, selected styling, onSelect callback, disabled state | 10 |

### Android — 14 tests in 1 file

| File | Subject | Tests |
|---|---|---|
| `ArtistTest.kt` | `spotifyId` URL parsing, default fields, data class equality, `Socials` defaults | 14 |

---

## Stack

**Web:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [jest-dom](https://github.com/testing-library/jest-dom)

**Android:** JUnit 4 (on-host, no device needed)

Config: `vitest.config.ts` — jsdom environment, globals enabled, path alias `@` → `src/`.

Setup file: `src/test/setup.ts` — imports `@testing-library/jest-dom` matchers.

---

## Conventions

### Mocking `useInsider()`

Most components and hooks depend on `InsiderProvider`. Mock it at the top of the test file:

```ts
vi.mock('@/components/layout/insider-provider', () => ({
  useInsider: () => ({
    config: mockConfig,          // see makeConfig() in use-translation.test.ts
    features: mockConfig.features,
    batterySaver: false,
    toggleBatterySaver: vi.fn(),
    getStorageKey: (k: string) => `test:${k}`,
    isOnline: true,
    lineup: [],
    favorites: {},
    toggleFavorite: vi.fn(),
  }),
}))
```

The full `makeConfig()` fixture is defined in `use-translation.test.ts` — copy it when you need a complete `FestivalConfig` shape.

### Mocking `next/navigation`

Any component or hook that imports from `next/navigation`:

```ts
vi.mock('next/navigation', () => ({
  useParams: () => ({ festivalId: 'sziget-2026' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/sziget-2026',
}))
```

### React Hook Testing

Hooks that read state via `useCallback` closures need state to settle before calling the callback. Always use separate `act()` calls:

```ts
// Wrong — computeResults reads stale state
act(() => {
  result.current.setEnergy('CHILL')
  result.current.computeResults()  // state not yet updated
})

// Correct
act(() => { result.current.setEnergy('CHILL') })
act(() => { result.current.computeResults() })
```

### Rate Limiter Tests

`rate-limit.ts` uses a module-level `Map` that persists across tests. Always use a unique key per test to avoid state leakage:

```ts
let keyCounter = 0
const uniqueKey = (label: string) => `test-${label}-${++keyCounter}`
```

### Fake Timers

Use for: rate-limit window expiry, toast dismiss delays, any `setTimeout`/`setInterval` logic.

```ts
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

vi.advanceTimersByTime(60_001) // advance past a 60s window
```

### Fetch Mocking

Use `vi.spyOn(global, 'fetch')` and always restore in `afterEach`:

```ts
afterEach(() => vi.restoreAllMocks())

function mockFetch(body: unknown, ok = true) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok, json: async () => body,
  } as Response)
}
```

### Vibration API

jsdom does not implement `navigator.vibrate`. Inject it with `Object.defineProperty`:

```ts
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(() => true),
  configurable: true,
  writable: true,
})
```

---

## Known Quirks (Documented in Tests)

**`useLineupDiff` stays loading when `currentLineup` is empty**
The `useEffect` guard `if (!festivalId || currentLineup.length === 0) return` exits before calling `setIsLoading(false)`. The hook is stuck at `isLoading: true` indefinitely when the current lineup hasn't loaded yet. Tracked; acceptable for MVP.

**`useClashResolver` treats `null === null` as a day match**
Artists with `day: null` (all artists, since schedule is TBA) will clash with each other if both have time data. In practice this never fires because `startTime`/`endTime` are also always `null`.

**`QuizOptionCard` uses hardcoded hex colors**
The selected state uses `border-[#FFED4E]` and `bg-[#1a1a1a]` rather than CSS variables, making it non-theme-aware. This is a white-label compliance gap.

---

## What Is Not Tested

- **API routes** (`src/app/api/`) — require an HTTP server; suitable for integration tests with `msw` or a test server, not added yet.
- **AI flows** (`src/ai/flows/`) — call Gemini externally; test with `GOOGLE_GENAI_API_KEY` set or mock the Genkit client.
- **Android ViewModels** — `DiscoverViewModel` and `VibeQuizViewModel` require `Context` to load assets. Needs Robolectric or an interface abstraction over `LineupRepository` before unit testing is practical.
- **Service Worker** (`public/sw.js`) — browser-only; test with Playwright or Workbox test utilities.
- **E2E / UI** — no Playwright or Cypress setup yet.
