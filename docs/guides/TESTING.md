# Testing Strategy & Setup

**Last updated:** 2026-05-17
**Status:** ✅ Web suite complete. Android unit tests: 1 file (ArtistTest.kt).
**Current count:** 198 passing tests (Web), see `docs/TESTING.md` for full breakdown.

---

## TLDR

- **Web:** Vitest + React Testing Library — 198 tests across 17 files ✅
- **Android:** JUnit4 — ArtistTest.kt covers model parsing ✅ (ViewModels not yet tested)
- **Authoritative test guide:** `docs/TESTING.md` (kept current, full table of all test files)
- **Run tests:** `npm test` (Web), `./gradlew test` (Android)

---

## Table of Contents

1. [Test Strategy](#test-strategy)
2. [Web Testing](#web-testing)
3. [Android Testing](#android-testing)
4. [CI/CD Integration](#cicd-integration)
5. [Test Fixtures](#test-fixtures)

---

## Test Strategy

### Philosophy

**Test critical user journeys, not implementation details.**

```typescript
// ❌ DON'T test: implementation details
test('renders ArtistCard with specific CSS class', () => {
  expect(element).toHaveClass('artist-card--featured');
});

// ✅ DO test: user-facing behavior
test('displays artist name and allows favoriting', () => {
  expect(screen.getByText('KAYTRANADA')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
  expect(onToggleFavorite).toHaveBeenCalledWith('artist-id');
});
```

### Coverage Targets

| Component Type | Target | Rationale |
|---|---|---|
| Pages (routes) | 50% | Test happy path + error state |
| Components | 70% | Core logic + edge cases |
| Utilities | 90% | Pure functions; exhaustive |
| ViewModels | 80% | State transitions |
| Repositories | 60% | Mock external dependencies |

### Test Pyramid

```
        🔺 E2E (5%)
       / \         Critical user flows (Spotify auth, favorites)
      /___\
     ┌─────┐
    ╱       ╲      Integration (15%)
   ╱─────────╲     Combine modules (ViewModel + Repository)
  ╱           ╲
 ┌─────────────┐
╱               ╲   Unit (80%)
╱─────────────────╲  Isolated components, utilities
```

---

## Web Testing

### Setup

**Framework:** Vitest + React Testing Library
**Config:** `vitest.config.ts` (already present)
**Run:** `npm test` (watch mode) or `npm test -- --run` (CI)

### 1. Unit Tests: Components

```typescript
// src/components/artist/__tests__/ArtistCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { ArtistCard } from '../ArtistCard';

describe('ArtistCard', () => {
  const mockArtist = {
    id: '1',
    artist: 'KAYTRANADA',
    genres: ['ELECTRONIC'],
    vibes: ['Dance'],
    imageUrl: 'https://...',
    isHeadliner: true,
    countryCode: 'CA',
  };

  test('renders artist name and country', () => {
    render(
      <ArtistCard
        artist={mockArtist}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    );

    expect(screen.getByText('KAYTRANADA')).toBeInTheDocument();
    expect(screen.getByText(/CA/i)).toBeInTheDocument();
  });

  test('displays filled star when favorite', () => {
    render(
      <ArtistCard
        artist={mockArtist}
        isFavorite={true}
        onToggleFavorite={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /favorite/i })).toHaveClass('filled');
  });

  test('calls onToggleFavorite when star clicked', () => {
    const onToggle = jest.fn();
    render(
      <ArtistCard
        artist={mockArtist}
        isFavorite={false}
        onToggleFavorite={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  test('navigates to artist detail on card click', () => {
    const onClick = jest.fn();
    render(
      <ArtistCard
        artist={mockArtist}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('KAYTRANADA'));
    expect(onClick).toHaveBeenCalledWith('1');
  });

  test('shows placeholder image when imageUrl missing', () => {
    const artistNoImage = { ...mockArtist, imageUrl: null };
    render(
      <ArtistCard
        artist={artistNoImage}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    );

    expect(screen.getByAltText(/placeholder/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Tests: Pages

```typescript
// src/app/discover/__tests__/page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscoverPage from '../page';

jest.mock('@/data/lineup.json', () => [
  { id: '1', artist: 'Artist 1', genres: ['MUSIC'], vibes: ['Dance'], day: 'Friday' },
  { id: '2', artist: 'Artist 2', genres: ['MUSIC'], vibes: ['Chill'], day: 'Saturday' },
]);

describe('Discover Page', () => {
  test('loads and displays artists', async () => {
    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByText('Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Artist 2')).toBeInTheDocument();
    });
  });

  test('filters artists by day', async () => {
    const user = userEvent.setup();
    render(<DiscoverPage />);

    await user.click(screen.getByRole('button', { name: /friday/i }));

    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.queryByText('Artist 2')).not.toBeInTheDocument();
  });

  test('shows error message on load failure', async () => {
    jest.mock('@/data/lineup.json', () => {
      throw new Error('Failed to load');
    });

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(screen.getByText(/could not load artists/i)).toBeInTheDocument();
    });
  });
});
```

### 3. Utility Tests

```typescript
// src/lib/__tests__/spotify.ts

import { getAuthUrl } from '@/lib/spotify';

describe('Spotify utilities', () => {
  test('generates valid OAuth URL', () => {
    const url = getAuthUrl();

    expect(url).toContain('https://accounts.spotify.com/authorize');
    expect(url).toContain('client_id=');
    expect(url).toContain('redirect_uri=');
    expect(url).toContain('scope=user-library-read');
  });

  test('includes all required scopes', () => {
    const url = getAuthUrl();
    const scopes = new URL(url).searchParams.get('scope')?.split('+') || [];

    expect(scopes).toContain('user-library-read');
    expect(scopes).toContain('playlist-modify-private');
    expect(scopes).toContain('playlist-modify-public');
  });
});
```

### Running Tests

```bash
# Watch mode (development)
npm test

# Run once (CI)
npm test -- --run

# Single file
npm test -- ArtistCard.test.tsx

# With coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

---

## Android Testing

### Setup

**Framework:** JUnit 4 + Espresso
**Dependencies:**
```gradle
testImplementation 'junit:junit:4.13.2'
testImplementation 'org.mockito:mockito-core:5.2.1'
androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
androidTestImplementation 'androidx.test:runner:1.5.2'
```

### 1. Unit Tests: ViewModels

```kotlin
// ui/discover/__tests__/DiscoverViewModelTest.kt

import androidx.lifecycle.asLiveData
import org.junit.Before
import org.junit.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import kotlinx.coroutines.test.runTest

class DiscoverViewModelTest {
  @Mock
  private lateinit var repository: LineupRepository

  private lateinit var viewModel: DiscoverViewModel

  @Before
  fun setup() {
    MockitoAnnotations.openMocks(this)
    viewModel = DiscoverViewModel(repository)
  }

  @Test
  fun loadArtistsOnInit() = runTest {
    val artists = listOf(
      createMockArtist(id = "1", artist = "Artist 1"),
      createMockArtist(id = "2", artist = "Artist 2")
    )
    `when`(repository.getLineup()).thenReturn(artists)

    val observedArtists = mutableListOf<List<Artist>>()
    viewModel.allArtists.collect {
      observedArtists.add(it)
    }

    assert(observedArtists.last().size == 2)
  }

  @Test
  fun filterArtistsByDay() = runTest {
    val artists = listOf(
      createMockArtist(id = "1", day = "Friday"),
      createMockArtist(id = "2", day = "Saturday")
    )
    `when`(repository.getLineup()).thenReturn(artists)

    viewModel.selectDay("Friday")

    val filtered = mutableListOf<List<Artist>>()
    viewModel.filteredArtists.collect {
      filtered.add(it)
    }

    assert(filtered.last().all { it.day == "Friday" })
  }

  @Test
  fun clearSearchQuery() = runTest {
    viewModel.setSearchQuery("test")
    assert(viewModel.searchQuery.value == "test")

    viewModel.setSearchQuery("")
    assert(viewModel.searchQuery.value == "")
  }

  private fun createMockArtist(
    id: String = "1",
    artist: String = "Test Artist",
    day: String? = "Friday"
  ) = Artist(
    id = id,
    artist = artist,
    day = day,
    genres = listOf("MUSIC"),
    vibes = listOf("Dance"),
    isHeadliner = false
  )
}
```

### 2. Integration Tests: Room Database

```kotlin
// data/local/__tests__/UserDaoTest.kt

import androidx.room.Room
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import kotlinx.coroutines.test.runTest

@RunWith(AndroidJUnit4::class)
class UserDaoTest {
  private lateinit var db: AppDatabase
  private lateinit var userDao: UserDao

  @Before
  fun setup() {
    val context = InstrumentationRegistry.getInstrumentation().targetContext
    db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).build()
    userDao = db.userDao()
  }

  @After
  fun cleanup() {
    db.close()
  }

  @Test
      id = 1,
      legendXp = 100,
    )

    assert(retrieved.legendXp == 100)
  }

  @Test
  fun toggleFavoriteArtist() = runTest {
    val favorite = FavoriteArtist(artistId = "artist-1")
    userDao.insertFavorite(favorite)

    val exists = userDao.getFavorite("artist-1")
    assert(exists != null)

    userDao.deleteFavorite("artist-1")
    val gone = userDao.getFavorite("artist-1")
    assert(gone == null)
  }
}
```

### 3. UI Tests: Composables

```kotlin
// ui/discover/__tests__/DiscoverScreenTest.kt

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test

class DiscoverScreenTest {
  @get:Rule
  val composeTestRule = createComposeRule()

  @Test
  fun displaysArtistGrid() {
    val mockArtists = listOf(
      createMockArtist("1"),
      createMockArtist("2")
    )

    composeTestRule.setContent {
      DiscoverScreen(onArtistClick = {}, navController = null)
    }

    composeTestRule
      .onNodeWithText("MUSIC FINDER")
      .assertExists()

    composeTestRule
      .onNodeWithContentDescription("Search")
      .assertExists()
  }

  @Test
  fun searchFiltersArtists() {
    composeTestRule.setContent {
      DiscoverScreen(onArtistClick = {}, navController = null)
    }

    // Type in search
    composeTestRule
      .onNodeWithContentDescription("Search")
      .performTextInput("KAYTRANADA")

    // Verify filtered result
    composeTestRule
      .onNodeWithText("KAYTRANADA")
      .assertExists()
  }

  @Test
  fun favoriteButtonTogglesFavorite() {
    composeTestRule.setContent {
      DiscoverScreen(onArtistClick = {}, navController = null)
    }

    // Find favorite button
    val favoriteButton = composeTestRule
      .onAllNodesWithContentDescription("Favorite")
      .onFirst()

    favoriteButton.performClick()
    // Verify favorite was toggled (check Room DB or UI state)
  }
}
```

### Running Tests

```bash
# Unit tests (doesn't need device)
./gradlew test

# Instrumented tests (needs device/emulator)
./gradlew connectedAndroidTest

# Single test
./gradlew test --tests "DiscoverViewModelTest"

# With coverage
./gradlew testCoverage
```

---

## CI/CD Integration

### GitHub Actions (Example)

```yaml
# .github/workflows/test.yml

name: Tests

on: [push, pull_request]

jobs:
  web-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --run --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  android-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
      - run: cd android && ./gradlew test
      - uses: codecov/codecov-action@v3
        with:
          files: ./android/app/build/reports/jacoco/testCoverage/testCoverageReport.xml
```

---

## Test Fixtures

### Shared Mock Artist

```typescript
// src/__tests__/fixtures/mockArtist.ts

export const mockArtist = {
  id: '1',
  artist: 'KAYTRANADA',
  stage: null,
  day: 'Friday',
  startTime: null,
  endTime: null,
  countryCode: 'CA',
  genres: ['MUSIC', 'ELECTRONIC'],
  szigetUrl: 'https://...',
  socials: {
    website: null,
    facebook: null,
    instagram: 'https://instagram.com/kaytranada',
    twitter: null,
    x: null,
    tiktok: null,
    youtube: null,
    spotify: 'https://open.spotify.com/artist/0I2XqVXqHScXjSH0JDtIqf',
    appleMusic: null,
    soundcloud: null
  },
  description: 'Canadian producer...',
  imageUrl: 'https://...',
  vibes: ['Dance', 'Electronic'],
  isHeadliner: true
};

export const createMockArtist = (overrides = {}) => ({
  ...mockArtist,
  ...overrides
});
```

### Shared Mock Repository

```kotlin
// data/repository/__tests__/MockLineupRepository.kt

class MockLineupRepository(
  private val artists: List<Artist> = emptyList()
) : LineupRepository {
  override suspend fun getLineup(year: String): List<Artist> = artists
}
```

---

## Testing Checklist

Before shipping a feature:

- [ ] Unit tests for new components (70%+ coverage)
- [ ] Integration tests for data flows
- [ ] Manual smoke test on device
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No Android lint warnings (`./gradlew lint`)
- [ ] Accessibility: TAB key navigates, form labels present
- [ ] Error handling: Try/catch blocks, graceful fallbacks
- [ ] Haptic feedback: All interactive elements trigger haptic

---

## Related Files

- `vitest.config.ts` — Web test configuration
- `android/app/build.gradle.kts` — Android test dependencies
- `src/__tests__/` — Web test examples
- `docs/guides/KNOWN_ISSUES.md` — Known gaps in test coverage
