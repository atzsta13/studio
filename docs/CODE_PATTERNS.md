# Code Patterns Guide

**Last updated:** 2026-03-20
**Scope:** Shared patterns across Web (Next.js/React) and Android (Compose/Kotlin)
**Goal:** Consistency + LLM efficiency

---

## TLDR

- **Error handling:** Try/catch + graceful fallback (empty list, null, error state)
- **Loading states:** Show skeleton → content → error
- **Filtering:** Immutable flow (combine filters, derive result)
- **Navigation:** Use built-in Router (Web) / NavController (Android)
- **State:** Server when possible; client only when interactive

---

## Table of Contents

1. [Error Handling](#error-handling)
2. [Loading & Skeleton States](#loading--skeleton-states)
3. [Filtering & Search](#filtering--search)
4. [Navigation](#navigation)
5. [Form Validation](#form-validation)
6. [Theming & Styling](#theming--styling)
7. [Testing Patterns](#testing-patterns)

---

## Error Handling

### Web Pattern: Server Component + Graceful Fallback

```typescript
// src/app/discover/page.tsx (Server Component)

async function DiscoverPage() {
  let artists: LineupItem[] = [];
  let error: string | null = null;

  try {
    artists = await getLineup();
  } catch (err) {
    console.error('Failed to load lineup:', err);
    error = 'Could not load artists. Please try again later.';
  }

  return (
    <div>
      {error ? (
        <ErrorBanner message={error} />
      ) : artists.length > 0 ? (
        <ArtistGrid artists={artists} />
      ) : (
        <EmptyState message="No artists found" />
      )}
    </div>
  );
}
```

**Key points:**
- Catch at boundary (page level)
- Log error (for debugging)
- Show user-friendly message (not stack trace)
- Fallback content (empty list, error banner)

### Android Pattern: Repository + Fallback

```kotlin
// data/repository/LineupRepository.kt

suspend fun getLineup(year: String = "2026"): List<Artist> =
  withContext(Dispatchers.IO) {
    try {
      val json = context.assets.open("lineup_$year.json").bufferedReader().readText()
      Json { ignoreUnknownKeys = true }.decodeFromString(json)
    } catch (e: Exception) {
      e.printStackTrace()
      emptyList()  // ← Graceful fallback
    }
  }
```

**Key points:**
- Use `withContext(Dispatchers.IO)` for file/network operations
- Always provide fallback (empty list, null, default object)
- Log exception (don't swallow silently)
- Never throw from repository (let ViewModel handle)

### Shared Pattern: Error States

```typescript
// Web
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

```kotlin
// Android
sealed class UiState<T> {
  object Idle : UiState<T>()
  object Loading : UiState<T>()
  data class Success(val data: T) : UiState<T>()
  data class Error(val message: String) : UiState<T>()
}
```

**Usage:**
```typescript
// Web
{state.status === 'error' && (
  <Toast message={state.error} type="error" />
)}

// Android
when (uiState) {
  is UiState.Error -> {
    LaunchedEffect(Unit) {
      haptic.mediumTap()
      showErrorToast(uiState.message)
    }
  }
  // ...
}
```

---

## Loading & Skeleton States

### Web: Loading Skeleton

```typescript
// src/components/ui/LoadingSkeleton.tsx

export function LoadingSkeleton({ type, count = 6 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {type === 'card' && (
            <div className="h-64 bg-gray-800 rounded-lg" />
          )}
          {type === 'text' && (
            <div className="h-4 bg-gray-800 rounded w-3/4" />
          )}
        </div>
      ))}
    </>
  );
}

// Usage in page
{isLoading ? (
  <LoadingSkeleton type="card" count={6} />
) : (
  <ArtistGrid artists={artists} />
)}
```

### Android: Loading State

```kotlin
// ui/discover/DiscoverScreen.kt

if (isLoading) {
  Box(
    modifier = Modifier.fillMaxSize(),
    contentAlignment = Alignment.Center
  ) {
    CircularProgressIndicator(color = PrimaryMagenta)
  }
} else if (filteredArtists.isEmpty()) {
  Text("No artists found")
} else {
  LazyVerticalGrid(columns = GridCells.Fixed(2)) {
    items(filteredArtists) { artist ->
      ArtistCard(artist = artist, ...)
    }
  }
}
```

### Pattern: Loading → Content → Error

```typescript
// Universal pattern across both platforms

const states = {
  idle: () => null,                    // Don't show anything
  loading: () => <Skeleton />,         // Show placeholder
  success: (data) => <Content />,      // Show actual content
  error: (err) => <ErrorBanner />      // Show error message
};

return states[state.status]();
```

---

## Filtering & Search

### Web: Immutable StateFlow Pattern

```typescript
// src/app/discover/page.tsx ('use client')

export default function DiscoverPage() {
  const [filters, setFilters] = useState({
    query: '',
    day: null as string | null,
    genre: null as string | null,
    vibe: null as string | null,
  });

  const filtered = useMemo(() => {
    let result = allArtists;
    if (filters.query) {
      result = result.filter(a => a.artist.includes(filters.query));
    }
    if (filters.day) {
      result = result.filter(a => a.day === filters.day);
    }
    if (filters.genre) {
      result = result.filter(a => a.genres.includes(filters.genre));
    }
    if (filters.vibe) {
      result = result.filter(a => a.vibes.includes(filters.vibe));
    }
    return result;
  }, [allArtists, filters]);

  return (
    <>
      <SearchBar
        value={filters.query}
        onChange={(query) => setFilters(f => ({ ...f, query }))}
      />
      <FilterChip
        label="Day"
        selected={filters.day}
        onSelect={(day) => setFilters(f => ({ ...f, day }))}
      />
      <ArtistGrid artists={filtered} />
    </>
  );
}
```

**Key points:**
- Immutable updates: `{ ...f, day }` not `f.day = day`
- Derive filtered list from all pieces of state
- Memoize expensive computations

### Android: StateFlow Composition Pattern

```kotlin
// ui/discover/DiscoverViewModel.kt

class DiscoverViewModel(private val repository: LineupRepository) : ViewModel() {
  private val _searchQuery = MutableStateFlow("")
  private val _selectedDay = MutableStateFlow<String?>(null)
  private val _selectedGenre = MutableStateFlow<String?>(null)
  private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())

  val filteredArtists: StateFlow<List<Artist>> = combine(
    _allArtists,
    _searchQuery,
    _selectedDay,
    _selectedGenre
  ) { artists, query, day, genre ->
    artists.filter { a ->
      (day == null || a.day == day) &&
      (genre == null || a.genres.contains(genre)) &&
      (query.isEmpty() || a.artist.contains(query, ignoreCase = true))
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  fun setSearchQuery(query: String) { _searchQuery.value = query }
  fun selectDay(day: String?) { _selectedDay.value = day }
  fun selectGenre(genre: String?) { _selectedGenre.value = genre }
}
```

**Key points:**
- Combine multiple StateFlows into derived flow
- Filtering logic centralized in ViewModel
- Composable: each filter is independent

### Common Pattern: Multi-Filter with Toggles

```typescript
// Apply OR logic for same type, AND logic across types

// Genre: one OR multiple (genre1 OR genre2) AND (day) AND (vibe)
const filtered = artists.filter(a => {
  const matchesGenre = selectedGenres.length === 0 ||
    selectedGenres.some(g => a.genres.includes(g));
  const matchesDay = selectedDay === null || a.day === selectedDay;
  const matchesVibe = selectedVibe === null || a.vibes.includes(selectedVibe);

  return matchesGenre && matchesDay && matchesVibe;
});
```

---

## Navigation

### Web: Next.js App Router

```typescript
// src/app/discover/page.tsx → /discover

import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <button onClick={() => router.push(`/artist/${artistId}`)}>
      View Artist
    </button>
  );
}
```

**Valid routes:**
- `/` — Home
- `/discover` — Artist grid
- `/artist/[id]` — Artist detail (id = "1", "2", ..., "80")
- `/map` — Map
- `/timetable` — Schedule
- `/passport` — Stamps + XP
- `/tools` — Survival toolkit
- `/food` — Food vendors
- `/packing-list` — Packing checklist
- `/guide` — Survival guide
- `/highlights` — Post-festival wrap

### Android: Jetpack Navigation

```kotlin
// ui/navigation/Navigation.kt

navController.navigate("artist/${artist.id}")  // Push detail screen
navController.popBackStack()                   // Go back

// From Composable
navController?.navigate("vibe_quiz")
navController?.navigate("highlights")
```

**Valid routes:**
- `home`, `discover`, `map`, `passport`, `tools` — Bottom nav
- `artist/{id}` — Artist detail
- `vibe_quiz`, `vibe_results` — Quiz flow
- `schedule`, `guide`, `food`, `highlights` — Full-screen modals

### Pattern: Conditional Navigation

```typescript
// Web: Check state before navigating
const handleComplete = () => {
  if (data.isValid) {
    router.push('/next-page');
  } else {
    setError('Please fix errors');
  }
};

// Android: Check state before navigating
Button(
  onClick = {
    if (quizAnswers.isComplete) {
      navController?.navigate("quiz_results")
    } else {
      showError("Please answer all questions")
    }
  }
) { Text("Next") }
```

---

## Form Validation

### Web Pattern: Real-Time Validation

```typescript
// src/components/tools/CurrencyConverter.tsx ('use client')

export function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (value: string) => {
    setAmount(value);

    // Validate on change
    const newErrors: string[] = [];
    if (!value) newErrors.push('Amount required');
    if (isNaN(Number(value))) newErrors.push('Must be a number');
    if (Number(value) < 0) newErrors.push('Must be positive');

    setErrors(newErrors);
  };

  return (
    <>
      <input
        value={amount}
        onChange={(e) => handleChange(e.target.value)}
        className={errors.length > 0 ? 'border-red-500' : 'border-gray-300'}
      />
      {errors.map(err => (
        <span key={err} className="text-red-500">{err}</span>
      ))}
    </>
  );
}
```

### Android Pattern: TextField Validation

```kotlin
// ui/tools/CurrencyConverter.kt

var amount by remember { mutableStateOf("1000") }
var amountError by remember { mutableStateOf<String?>(null) }

val handleAmountChange = { value: String ->
  amount = value
  amountError = when {
    value.isEmpty() -> "Amount required"
    value.toIntOrNull() == null -> "Must be a number"
    value.toInt() < 0 -> "Must be positive"
    else -> null
  }
}

OutlinedTextField(
  value = amount,
  onValueChange = handleAmountChange,
  isError = amountError != null,
  supportingText = { amountError?.let { Text(it) } }
)
```

### Pattern: Submit Validation

```typescript
// Validate entire form before submit

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const errors = validate({ email, password, name });
  if (errors.length > 0) {
    setErrors(errors);
    return;  // Don't submit
  }

  // All valid, submit
  onSubmit({ email, password, name });
};
```

---

## Theming & Styling

### Web: Tailwind CSS

```typescript
// Use theme tokens from tailwind.config.ts

<div className="
  bg-background      // OLED black
  text-white         // Primary text
  p-4                // Padding
  rounded-lg         // Border radius
  border border-white/5  // Subtle border
">
  {content}
</div>
```

**Common classes:**
- `bg-background`, `bg-card`, `bg-muted`
- `text-primary`, `text-muted-foreground`
- `border-white/5` (5% white opacity)
- `hover:scale-[1.02]` (subtle scale on hover)

### Android: Compose Theme

```kotlin
// Use Color tokens from ui/theme/Color.kt

Box(
  modifier = Modifier
    .background(OLEDBlack)
    .border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(16.dp))
    .padding(16.dp)
) {
  Text("Content", color = TextPrimary)
}
```

**Common patterns:**
- `background(OLEDBlack)` — Always black
- `border(1.dp, Color.White.copy(alpha = 0.06f), ...)` — Subtle depth
- `RoundedCornerShape(16.dp)` — Rounded corners
- `color = TextMuted` — Secondary text

### Cross-Platform Theme Consistency

| Concept | Web | Android | Notes |
|---------|-----|---------|-------|
| Background | `bg-background` | `OLEDBlack` | Always black |
| Card | `bg-card/50` | `CardBackground` | ~15% white |
| Primary action | `text-primary` | `TextPrimary` | White |
| Secondary text | `text-muted-foreground` | `TextMuted` | ~65% white |
| Accent: Favorites | `text-primary` | `PrimaryMagenta` | Pink/magenta |
| Accent: Active | `text-yellow` | `AcidYellow` | Bright yellow |
| Accent: Success | `text-green` | `ToxicGreen` | Bright green |
| Accent: Water | `text-cyan` | `CyanPulse` | Bright cyan |

---

## Testing Patterns

### Web: React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ArtistCard } from './ArtistCard';

test('displays artist name', () => {
  render(
    <ArtistCard
      artist={{ id: '1', artist: 'Test Artist', ... }}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />
  );

  expect(screen.getByText('Test Artist')).toBeInTheDocument();
});

test('toggles favorite on click', () => {
  const handleToggle = jest.fn();
  render(
    <ArtistCard
      artist={{ id: '1', artist: 'Test', ... }}
      isFavorite={false}
      onToggleFavorite={handleToggle}
    />
  );

  fireEvent.click(screen.getByRole('button'));
  expect(handleToggle).toHaveBeenCalledWith('1');
});
```

### Android: Composable Testing

```kotlin
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule

class ArtistCardTest {
  @get:Rule
  val composeTestRule = createComposeRule()

  @Test
  fun displaysArtistName() {
    composeTestRule.setContent {
      ArtistCard(
        artist = testArtist,
        isFavorite = false,
        onToggleFavorite = {}
      )
    }

    composeTestRule.onNodeWithText("Test Artist").assertExists()
  }

  @Test
  fun callsToggleOnFavoriteTap() {
    val onToggle = mockk<(String) -> Unit>()

    composeTestRule.setContent {
      ArtistCard(
        artist = testArtist,
        isFavorite = false,
        onToggleFavorite = onToggle
      )
    }

    composeTestRule.onNodeWithContentDescription("Favorite").performClick()
    verify { onToggle("1") }
  }
}
```

---

## Summary: Pattern Checklist

**When adding a new feature:**

- [ ] Error handling: Try/catch + fallback (empty list, null, error state)
- [ ] Loading state: Show skeleton while fetching
- [ ] Filtering: Immutable state updates, derive filtered list
- [ ] Navigation: Use built-in Router/NavController
- [ ] Validation: Check before submit, show errors inline
- [ ] Styling: Use theme tokens (no hardcoded colors)
- [ ] Testing: Unit test + integration test (if critical)
- [ ] Accessibility: Labels, alt text, tap targets ≥48dp

---

## Related Files

- `src/components/ui/` — Reusable UI components
- `android/app/src/main/java/.../ui/` — Android screens
- `tailwind.config.ts` — Web theme configuration
- `android/app/src/main/java/.../ui/theme/Color.kt` — Android colors
