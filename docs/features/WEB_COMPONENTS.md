# Web Component Inventory

**Last updated:** 2026-03-20
**Scope:** React 19 components in `src/components/`
**Pattern:** Server components by default; Client-side marked with "use client"

---

## TLDR

- ~40 components across 10 feature groups
- Organized by domain (spotify/, tools/, timetable/, etc.)
- Most are "use client" (client-side React)
- Reused across multiple pages via imports

---

## Table of Contents

1. [Navigation & Layout](#navigation--layout)
2. [Artist Components](#artist-components)
3. [Spotify Components](#spotify-components)
4. [Tools & Utilities](#tools--utilities)
5. [Timetable Components](#timetable-components)
6. [UI Primitives](#ui-primitives)
7. [Usage Examples](#usage-examples)

---

## Navigation & Layout

### `src/components/nav/BottomNav.tsx`

**Type:** Client component
**Props:**
```typescript
{
  currentPath: string;
  onNavigate: (path: string) => void;
}
```
**Used by:** Root layout (`src/app/layout.tsx`)
**Notes:** Hidden on splash, artist detail, schedule screens

---

## Artist Components

### `src/components/artist/ArtistCard.tsx`

**Type:** Client component
**Props:**
```typescript
{
  artist: LineupItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}
```
**Renders:** Clickable card with image, name, country, favorite star
**Reusability:** 3+ pages depend on this component

### `src/components/artist/ArtistGrid.tsx`

**Type:** Client component
**Props:**
```typescript
{
  artists: LineupItem[];
  isLoading: boolean;
  emptyMessage?: string;
  onArtistClick: (id: string) => void;
}
```
**Renders:** Responsive grid (2-3 cols) of ArtistCard
**Notes:** Handles loading skeleton

### `src/components/artist/SocialLinks.tsx`

**Type:** Client component
**Props:**
```typescript
{
  socials: Socials;
  artistName: string;
}
```
**Used by:** `/artist/[id]` (artist detail page)
**Renders:** Spotify, Instagram, Twitter, YouTube, etc. buttons
**Notes:** External links, opens in new tab

---

## Spotify Components

### `src/components/spotify/SpotifyConnect.tsx`

**Type:** Client component
**Props:**
```typescript
{
  onConnected?: (matchCount: number) => void;
  onError?: (error: string) => void;
}
```
**Used by:** `/discover`
**Renders:** "SYNC SPOTIFY LIBRARY" button + loading state
**Behavior:**
1. Calls `/api/auth/spotify/` → redirects to Spotify login
2. After callback: calls `/api/spotify/matches`
3. Displays: "X artists matched" chip

### `src/components/spotify/PlaylistBuilder.tsx`

**Type:** Client component
**Props:**
```typescript
{
  matchedArtistIds: string[];
  artists: LineupItem[];
  onPlaylistCreated?: (url: string) => void;
}
```
**Used by:** `/discover` (below SpotifyConnect)
**Renders:** "BUILD PLAYLIST" button + success message
**Behavior:**
1. Collects top 3 tracks per matched artist
2. POST to `/api/spotify/build-playlist`
3. Returns Spotify playlist URL
4. Shows "Open in Spotify" link

### `src/components/spotify/SpotifyEmbed.tsx`

**Type:** Server component
**Props:**
```typescript
{
  spotifyId: string;
  type: 'track' | 'artist' | 'playlist';
}
```
**Used by:** `/artist/[id]` (artist detail page)
**Renders:** Spotify Web Player iframe
**Notes:** No prop drilling needed (server-rendered)

---

## Tools & Utilities

### `src/components/tools/WeatherWidget.tsx`

**Type:** Client component
**Props:**
```typescript
{
  forecast: WeatherData;
  isLoading: boolean;
  onRefresh?: () => void;
}
```
**Used by:** `/tools` (Tactical tab)
**Renders:** 7-day forecast strip + rain alert banner
**Notes:** Calls `/api/weather` on mount, 30-min cache

### `src/components/tools/CurrencyConverter.tsx`

**Type:** Client component
**Props:**
```typescript
{
  rates: { [currency: string]: number };
}
```
**Used by:** `/tools` (Safety tab)
**Renders:** HUF ↔ EUR/GBP/USD input boxes
**Notes:** Real-time calculation as user types

### `src/components/tools/PackingChecklist.tsx`

**Type:** Client component
**Props:**
```typescript
{
  items: PackingItem[];
  onToggleItem: (id: string, checked: boolean) => void;
}
```
**Used by:** `/tools`, `/packing-list`
**Renders:** Collapsible categories (Camping, Clothing, Toiletries)
**Notes:** Persists to localStorage

### `src/components/tools/EmergencyContacts.tsx`

**Type:** Server component
**Props:** None (hardcoded content)
**Used by:** `/tools` (Safety tab)
**Renders:** Police, ambulance, embassy phone numbers + SMS templates

---

## Timetable Components

### `src/components/timetable/TimetableView.tsx`

**Type:** Client component
**Props:**
```typescript
{
  artists: LineupItem[];
  selectedDay: string | null;
  onArtistClick: (id: string) => void;
  onDayChange: (day: string) => void;
}
```
**Used by:** `/timetable`
**Renders:** Day-tab grid showing artist sets + clash detection
**Notes:** Currently placeholder (stage/time data not available)

### `src/components/timetable/ClashDetector.tsx`

**Type:** Client component
**Props:**
```typescript
{
  favoriteArtists: LineupItem[];
}
```
**Used by:** `/timetable` (when time data available)
**Renders:** Warning cards for overlapping favorites
**Notes:** Ready for schedule data; currently dormant

---

## UI Primitives

### `src/components/ui/FilterChip.tsx`

**Type:** Client component
**Props:**
```typescript
{
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: 'yellow' | 'magenta' | 'green' | 'cyan';
  disabled?: boolean;
}
```
**Used by:** `/discover` (day, genre, vibe, country filters)
**Renders:** Pill-shaped toggle button
**Reusability:** 5+ instances per page

### `src/components/ui/LoadingSkeleton.tsx`

**Type:** Client component
**Props:**
```typescript
{
  type: 'card' | 'text' | 'avatar';
  count?: number;
}
```
**Used by:** All grid/list components during fetch
**Renders:** Pulsing placeholder matching content shape

### `src/components/ui/Modal.tsx`

**Type:** Client component
**Props:**
```typescript
{
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: { label: string; onClick: () => void }[];
}
```
**Used by:** Vibe quiz, country explorer, share dialogs
**Renders:** Full-screen overlay with dimmed background

### `src/components/ui/Toast.tsx`

**Type:** Client component
**Props:**
```typescript
{
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss?: () => void;
}
```
**Used by:** All pages (error messages, confirmations)
**Renders:** Bottom toast notification
**Behavior:** Auto-dismisses after duration

---

## Usage Examples

### Example 1: Import ArtistCard in a server component

```typescript
// src/app/discover/page.tsx (Server Component)

import { ArtistCard } from '@/components/artist/ArtistCard';
import { getLineup } from '@/lib/lineup';

export default async function DiscoverPage() {
  const artists = await getLineup();

  return (
    <div>
      {/* Client-side wrapper needed for interactivity */}
      <ClientArtistGrid artists={artists} />
    </div>
  );
}
```

```typescript
// src/components/discover/ArtistGridWrapper.tsx ('use client')

import { ArtistCard } from '@/components/artist/ArtistCard';
import { useState } from 'react';

export function ClientArtistGrid({ artists }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  return (
    <div className="grid grid-cols-2 gap-4">
      {artists.map(a => (
        <ArtistCard
          key={a.id}
          artist={a}
          isFavorite={favorites.has(a.id)}
          onToggleFavorite={(id) => {
            const next = new Set(favorites);
            next.has(id) ? next.delete(id) : next.add(id);
            setFavorites(next);
          }}
          onClick={() => console.log('clicked', a.id)}
        />
      ))}
    </div>
  );
}
```

### Example 2: Use Spotify components in /discover

```typescript
// src/app/discover/page.tsx

'use client';

import { SpotifyConnect } from '@/components/spotify/SpotifyConnect';
import { PlaylistBuilder } from '@/components/spotify/PlaylistBuilder';
import { useState } from 'react';

export default function DiscoverPage() {
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  return (
    <>
      <SpotifyConnect
        onConnected={(count) => {
          // Fetch matches from /api/spotify/matches
          // Update matchedIds
        }}
      />
      {matchedIds.length > 0 && (
        <PlaylistBuilder matchedArtistIds={matchedIds} artists={...} />
      )}
    </>
  );
}
```

### Example 3: Add a new component following the pattern

```typescript
// src/components/myfeature/MyNewComponent.tsx

'use client'; // if interactive

import { ReactNode } from 'react';

interface MyNewComponentProps {
  title: string;
  content: ReactNode;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
}

export function MyNewComponent({
  title,
  content,
  onAction,
  variant = 'primary'
}: MyNewComponentProps) {
  return (
    <div className={`my-component ${variant}`}>
      <h2>{title}</h2>
      <div>{content}</div>
      {onAction && <button onClick={onAction}>Act</button>}
    </div>
  );
}
```

Then import in a page:

```typescript
import { MyNewComponent } from '@/components/myfeature/MyNewComponent';

export default function Page() {
  return <MyNewComponent title="..." content={...} />;
}
```

---

## Component Patterns

### Pattern 1: Server-rendered data, client-side interactivity

```typescript
// src/app/discover/page.tsx (Server)
const artists = await getLineup();

return <ClientDiscoverWrapper artists={artists} />;

// src/components/discover/DiscoverWrapper.tsx (Client)
'use client';
export function ClientDiscoverWrapper({ artists }) {
  const [filtered, setFiltered] = useState(artists);
  // ...
}
```

### Pattern 2: Prop drilling via composition

```typescript
// Avoid:
<Parent>
  <Child1 onToggle={...} onSelect={...} onDelete={...} />
</Parent>

// Prefer:
const ChildWithHandler = () => {
  const [state, setState] = useState(...);
  return <Child1 {...handlers} />;
};

<Parent>
  <ChildWithHandler />
</Parent>
```

### Pattern 3: Loading states

```typescript
{isLoading ? (
  <LoadingSkeleton type="card" count={6} />
) : artists.length > 0 ? (
  <ArtistGrid artists={artists} />
) : (
  <EmptyState message="No artists found" />
)}
```

---

## File Organization

```
src/components/
├── artist/                    # Artist card, grid, detail helpers
│   ├── ArtistCard.tsx
│   ├── ArtistGrid.tsx
│   └── SocialLinks.tsx
├── discover/                  # Discover page specific
│   ├── FilterRow.tsx
│   ├── SearchBar.tsx
│   └── CountryExplorer.tsx
│   └── ShareButton.tsx
├── map/                       # Map visualization
│   └── MapView.tsx
├── spotify/                   # Spotify OAuth + playlist
│   ├── SpotifyConnect.tsx
│   ├── PlaylistBuilder.tsx
│   └── SpotifyEmbed.tsx
├── timetable/                 # Schedule grid
│   ├── TimetableView.tsx
│   └── ClashDetector.tsx
├── tools/                     # Tools page utilities
│   ├── WeatherWidget.tsx
│   ├── CurrencyConverter.tsx
│   ├── PackingChecklist.tsx
│   └── EmergencyContacts.tsx
└── ui/                        # Generic UI primitives
    ├── FilterChip.tsx
    ├── LoadingSkeleton.tsx
    ├── Modal.tsx
    └── Toast.tsx
```

---

## Common Props Patterns

### Data Props

```typescript
// Always include `id` for keys
artist: { id: string; name: string; ... }
artists: LineupItem[]  // Array of full objects

// Booleans for state
isFavorite: boolean
isLoading: boolean
isOpen: boolean

// Strings for simple values
title: string
message: string
```

### Handler Props

```typescript
// Event handlers
onToggleFavorite: (id: string) => void
onArtistClick: (id: string) => void
onDayChange: (day: string) => void
onClose: () => void

// Data handlers
onRefresh: () => Promise<void>
onSubmit: (data: FormData) => void
```

### Optional Props

```typescript
// Defaults provided
variant?: 'primary' | 'secondary'  // default: 'primary'
size?: 'sm' | 'md' | 'lg'          // default: 'md'
disabled?: boolean                  // default: false

// Callbacks
onError?: (err: Error) => void
onSuccess?: (data: T) => void
```

---

## Testing Components

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { ArtistCard } from './ArtistCard';

test('renders artist name', () => {
  render(
    <ArtistCard
      artist={{ id: '1', name: 'Test Artist', ... }}
      isFavorite={false}
      onToggleFavorite={() => {}}
    />
  );
  expect(screen.getByText('Test Artist')).toBeInTheDocument();
});
```

---

## TODO: Components Awaiting Data

- `ClashDetector.tsx` — Waiting for stage/time data from Sziget
- `TimetableView.tsx` — Placeholder until schedule available
- Real food vendor cards (currently hardcoded POIs)

---

## Related Files

- `src/app/` — Pages that use these components
- `src/types/index.ts` — Type definitions (LineupItem, MapPin, etc.)
- `src/lib/` — Utilities called by components
- `tailwind.config.ts` — Styling configuration
