# Known Issues & Tech Debt Log

**Last updated:** 2026-05-17
**Format:** Severity (Critical/High/Medium/Low) + Status (Open/Workaround/Accepted)

---

## TLDR

- **1 critical:** Unencrypted Android tokens (MVP accepted, deferred to production)
- **1 high:** Missing Android tests (needs dedicated sprint)
- **3 medium:** No automated service worker update prompt, accessibility audit pending, prop drilling in discover
- **TypeScript:** ✅ 0 errors — all previously accepted TS issues fully resolved (2026-05-17)
- **White-label compliance:** ✅ Fully resolved — all hardcoded colors (#FFED4E, #0a0a0a etc.) replaced with CSS vars and FESTIVAL.theme.* (2026-05-17)
- **All actively tracked:** No hidden bugs

---

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [High Priority](#high-priority)
3. [Medium Priority](#medium-priority)
4. [Low Priority / Won't Fix](#low-priority--wont-fix)
5. [Deferred (Awaiting Sziget Data)](#deferred-awaiting-sziget-data)

---

## Critical Issues

### Issue #1: Pre-existing TypeScript Errors

**Severity:** 🔴 Critical
**Status:** ✅ Fixed (2026-05-17) — 0 TypeScript errors. GenreOption union extended with JAZZ/AMBIENT, test component return types corrected.
**Files Affected:**
- `src/types/index.ts` — GenreOption now includes JAZZ and AMBIENT
- `src/test/error-boundary.test.tsx` — Bomb/BombNoMsg typed as React.ReactNode

**Root Cause:**
- Schema changed (stage nullable) but types not updated
- AI flow config out of sync with TypeScript definitions
- Date parsing doesn't handle null startTime/endTime

**Impact:**
- Won't prevent build (tsc doesn't block Next.js build)
- Subtle bugs at runtime if code paths hit
- Reduces confidence in type safety

**Workaround:**
- Don't trigger vibe quiz date parsing until schedule data available
- AI flow works despite type mismatch
- Run `npm run typecheck` before committing

**Fix (when you have time):**
```typescript
// src/app/vibe-quiz/page.tsx — use type assertion as temporary fix
const artists = lineup as LineupItem[];  // ✅ Suppress error

// Later: fix properly
if (startTime && endTime) {
  const start = new Date(startTime);  // ✅ Guard null
}
```

**Impact on LLM:** None (build succeeds; type errors don't block feature work)

---

### Issue #2: Android Tokens Stored in SharedPreferences (Unencrypted)

**Severity:** 🔴 Critical
**Status:** ⏳ Accepted (MVP acceptable, not production)
**File:** `data/repository/SpotifyRepository.kt`

**Root Cause:**
SharedPreferences is world-readable on rooted devices. Access tokens should be in Android Keystore.

**Current Code:**
```kotlin
private fun saveTokens(tokens: SpotifyTokens) {
  prefs.edit().apply {
    putString(KEY_ACCESS_TOKEN, tokens.accessToken)  // ← PLAINTEXT
    tokens.refreshToken?.let { putString(KEY_REFRESH_TOKEN, it) }
    apply()
  }
}
```

**Risk:**
- Rooted device can read tokens
- Attacker could access user's Spotify account
- Low risk in practice (target audience unlikely to be rooted + hacked)

**Workaround:**
- No immediate fix needed for MVP
- Users can disconnect/revoke app access if compromised

**Fix (for production):**
```kotlin
// Use EncryptedSharedPreferences (androidx.security.crypto)
val masterKey = MasterKey.Builder(context)
  .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
  .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
  context,
  "spotify_tokens",
  masterKey,
  EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
  EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

encryptedPrefs.edit().putString(KEY_ACCESS_TOKEN, token).apply()  // ✅ Encrypted
```

**Dependencies needed:**
```gradle
implementation 'androidx.security:security-crypto:1.1.0-alpha06'
```

**Impact on LLM:** None (works as-is; production hardening deferred)

---

### Issue #3: No Error Boundaries / App Crash Recovery

**Severity:** 🔴 Critical
**Status:** ✅ Fixed (2026-03-31)
**Platforms:** Web + Android

**Root Cause:**
- Web: No Error Boundary component for cascading failures
- Android: No global exception handler for uncaught crashes

**Current Risk:**
- Page crash → whole app crashes (Web)
- Unhandled exception → ANR/crash (Android)
- User loses progress (no recovery)

**Example Crash Scenario:**
```typescript
// src/components/artist/ArtistGrid.tsx
filteredArtists.map(artist => {
  // If artist.imageUrl is missing + Coil throws:
  // Entire grid crashes, no error UI shown
  return <ArtistCard artist={artist} />
})
```

**Fix (Web):**
```typescript
// src/components/error-boundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <h2 className="text-red-400 font-bold">Something went wrong</h2>
          <p className="text-red-300 text-sm">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// src/app/layout.tsx
<ErrorBoundary>
  <body>{children}</body>
</ErrorBoundary>
```

**Fix (Android):**
```kotlin
// MainActivity.kt
override fun onCreate(savedInstanceState: Bundle?) {
  Thread.setDefaultUncaughtExceptionHandler { thread, exception ->
    Log.e("UncaughtException", "Crash:", exception)
    // Show error screen or restart app
    val intent = Intent(this, MainActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
    startActivity(intent)
    finish()
    Process.killProcess(Process.myPid())
  }
  super.onCreate(savedInstanceState)
}
```

**Impact on LLM:** Moderate (crash = no feedback; error messages help debugging)

---

## High Priority

### Issue #4: No Automated Android Tests

**Severity:** 🟠 High
**Status:** ❌ Open
**Impact:** Can't detect regressions; manual testing only

**Missing:**
- Unit tests for ViewModels
- Integration tests for Room database
- UI tests for critical paths (favorite toggle, Spotify flow)

**First test to add:**
```kotlin
// androidTest/.../ArtistViewModelTest.kt
class ArtistViewModelTest {
  @get:Rule
  val instantExecutorRule = InstantTaskExecutorRule()

  private lateinit var viewModel: ArtistViewModel
  private lateinit var dao: UserDao

  @Before
  fun setup() {
    val db = Room.inMemoryDatabaseBuilder(
      InstrumentationRegistry.getInstrumentation().targetContext,
      AppDatabase::class.java
    ).build()
    dao = db.userDao()
    viewModel = ArtistViewModel(dao)
  }

  @Test
  fun toggleFavoriteSavesToDb() = runBlocking {
    viewModel.toggleFavorite("artist-1")
    val favorite = dao.getFavorite("artist-1")
    assertNotNull(favorite)
  }
}
```

**Effort:** 40–60 hours (full coverage); 4–8 hours (core paths only)

---

### Issue #5: Web Component Over-Nesting (Prop Drilling)

**Severity:** 🟠 High
**Status:** ⏳ Accepted (works; defer to refactor cycle)
**Files:** `src/components/discover/`, `src/components/artist/`

**Example:**
```typescript
<DiscoverPage>
  <ArtistGrid artists={artists}>
    <ArtistCard artist={artist}>
      <FavoriteButton
        onToggle={onToggleFavorite}  // ← Drilled 3 levels deep
        isFavorite={isFavorite}       // ← Drilled 3 levels deep
      />
    </ArtistCard>
  </ArtistGrid>
</DiscoverPage>
```

**Better (React Context):**
```typescript
// src/context/FavoritesContext.tsx
const FavoritesContext = createContext<{
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
}>(...);

// In DiscoverPage
<FavoritesProvider>
  <ArtistGrid artists={artists} />  // No prop drilling
</FavoritesProvider>

// In FavoriteButton
const { isFavorite, toggle } = useContext(FavoritesContext);
```

**Current Status:** Works but harder to trace data flow
**Fix Effort:** 8 hours; defer until refactor cycle

---

## Medium Priority

### Issue #6: No Pagination in Spotify Library Scan

**Severity:** 🟡 Medium
**Status:** ✅ Fixed (2026-03-31) — removed artificial loop cap; pagination follows Spotify's `next` field naturally
**File:** `data/repository/SpotifyRepository.kt` (line ~67)

**Current Code:**
```kotlin
suspend fun getMatchedArtistIds(lineup: List<Artist>): Set<String> {
  var nextUrl: String? = "$API_URL/me/tracks?limit=50"
  var loopCount = 0

  while (nextUrl != null && loopCount < 50) {  // ← Limits to ~2500 tracks
    // ...
    nextUrl = trackPage.next
    loopCount++
  }
}
```

**Issue:**
- Scans max 2500 saved tracks
- Power users with 10,000+ tracks won't match all

**Fix:**
```kotlin
while (nextUrl != null && allSpotifyIds.size < 50000) {  // ← No loop limit
  // ...
}
```

**Impact:** Low (target audience unlikely to have 10k+ saves)

---

### Issue #7: Timezone Issues in Weather Endpoint

**Severity:** 🟡 Medium
**Status:** ✅ Fixed (2026-03-31) — dates now returned as ISO 8601 (`YYYY-MM-DDT00:00:00Z`)
**File:** `src/app/api/weather/route.ts`

**Current Code:**
```typescript
// Returns: { date: "2026-03-20", ... }
// Problem: Ambiguous timezone (UTC? Budapest?)
```

**Issue:**
- Android might interpret as local time
- Weather shows wrong day

**Fix:**
```typescript
return {
  daily: forecast.map(f => ({
    ...f,
    date: `${f.date}T00:00:00Z`,  // ← ISO 8601 with Z (UTC)
  })),
  timezone: 'Europe/Budapest'  // ← Add context
};
```

**Impact:** Low (only noticeable near midnight, Budapest timezone)

---

### Issue #8: No Clash Detection (Pending Schedule Data)

**Severity:** 🟡 Medium
**Status:** ⏳ Awaiting data
**File:** `src/components/timetable/ClashDetector.tsx`

**Current:** Component exists but dormant (stage/time fields null)
**Will activate:** When Sziget publishes schedule

**Ready to implement:**
- Parse start/end times
- Find overlaps in user favorites
- Show warning cards on timetable

---

### Issue #9: Food Vendor Data is Placeholder

**Severity:** 🟡 Medium
**Status:** ⏳ Awaiting real data
**File:** `android/app/src/main/assets/food.json`

**Current:** 10 hardcoded vendors
**Real data:** Sziget will provide ~50+ vendors + locations

**Impact:**
- Food screen shows demo data
- Real vendor list will replace this

**When data arrives:**
1. Replace `food.json`
2. Test map overlays (50+ pins shouldn't lag)
3. Verify dietary filter matching

---

### Issue #10: No Service Worker Updates on Android

**Severity:** 🟡 Medium
**Status:** ⏳ Design decision
**File:** `public/sw.js`

**Issue:**
- Web PWA caches app shell + API responses
- No update prompt for users (cache evergreen)
- If bug is deployed, users won't see fix for 30 days

**Options:**
1. **Current (no update):** Users see stale version; low support burden
2. **Prompt on update:** `register.onupdate → showUpdatePrompt()`
3. **Force update:** Service worker self-destructs + reloads

**Decision:** Current is acceptable for MVP. Revisit if critical bugs emerge.

---

### Issue #11: No Rate Limiting on `/api/` Routes

**Severity:** 🟡 Medium
**Status:** ✅ Fixed (2026-03-31) — `src/middleware.ts` + `src/lib/rate-limit.ts`; tiered limits (20/min AI, 60/min Spotify, 100/min other)
**Impact:** Malicious user could spam endpoints

**Example Scenario:**
```javascript
// Attacker's script
for (let i = 0; i < 1000; i++) {
  fetch('/api/ai/recommend', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'test' })
  });
}
// Costs Google API credits + overloads server
```

**Fix (using middleware):**
```typescript
// src/middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const isAllowed = await rateLimit(ip, {
      windowMs: 60000,
      maxRequests: 100
    });

    if (!isAllowed) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
  }

  return NextResponse.next();
}
```

**Effort:** 4 hours
**Priority:** Raise if bot activity detected

---

## Low Priority / Won't Fix

### Issue #12: Web Component Missing Suspense Boundaries

**Severity:** 🟢 Low
**Status:** 🎯 Won't fix (React 19 not required)
**Impact:** Minor performance

**Notes:**
- Streaming not needed for static content
- All data available at page render time
- Deferring to React 19 upgrade cycle

---

### Issue #13: No Accessibility (a11y) Audit

**Severity:** 🟢 Low
**Status:** 🎯 Won't fix (MVP acceptable)
**Impact:** Screen readers, keyboard navigation

**Current:** Buttons/links are functional but semantic HTML could be better

**Example improvements:**
- Add `aria-label` to icon buttons
- Add `role="region"` to major sections
- Ensure color contrast ratio ≥ 4.5:1

**Effort:** 8–12 hours for full audit
**Defer:** Until A11y specialist available

---

### Issue #14: Android Widget Crashes on Empty Favorites

**Severity:** 🟢 Low
**Status:** ✅ Fixed (commit abc123)
**Details:** Widget displayed "null" when user had 0 favorites

---

### Issue #15: DiscoverViewModel Pending Filter via Companion Object

**Severity:** 🟢 Low
**Status:** ✅ Already fixed — filter is passed via `navController.currentBackStackEntry.savedStateHandle`; companion object pattern was never shipped
**File:** `ui/discover/DiscoverViewModel.kt`

**Context:**
Genre/vibe tag clicks on ArtistDetailScreen navigate back to Discover and apply a filter. The filter value is passed via a static companion object (`pendingGenreFilter`, `pendingVibeFilter`) rather than a proper navigation argument or shared ViewModel.

**Risk:**
- If ViewModel is recreated unexpectedly, filter could be missed
- Not testable in isolation

**Fix (when time allows):**
Use `savedStateHandle` in DiscoverViewModel or pass filter as a navigation argument.

---

## Deferred (Awaiting Sziget Data)

These features are blocked by Sziget not publishing data yet:

| Feature | Awaiting | Status |
|---------|----------|--------|
| Schedule / Timetable | stage, startTime, endTime | ❌ Data not published |
| Clash Detection | startTime, endTime | ❌ Data not published |
| Real Food Vendors | Vendor list + locations | ⏳ Promised "by June" |
| Real POI Locations | Updated map data | ⏳ Promised "by July" |
| Stage Names | stage field population | ❌ Data not published |

**When these arrive:**
1. Replace JSON files
2. Run full regression test suite
3. Test schedule/clash detection
4. Verify map scales with 50+ POIs

---

## FAQ

**Q: Why don't you fix all these?**
A: Prioritization. Spotify integration, core features, and test coverage first. These are tracked but lower impact.

**Q: Will pre-existing TypeScript errors cause problems?**
A: Unlikely. Build succeeds; issues would only surface if code paths hit. Type checking is best-effort.

**Q: When should I file a new issue?**
A: When you find a bug that:
1. Breaks existing functionality (not future-facing)
2. Affects user experience
3. Is reproducible + documented

Add it to this file with: Severity + Status + Files + Root Cause + Fix.

**Q: Why unencrypted Android tokens?**
A: MVP acceptable. Real Sziget app in production would use Keystore. Add to security backlog for v2.

---

## Related Files

- `.github/ISSUE_TEMPLATE/` — (if this were OSS)
- `docs/guides/TROUBLESHOOTING.md` — Common user-facing issues
- `docs/guides/TESTING.md` — Test coverage + strategy
