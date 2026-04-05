# Architecture

Sziget Insider 2026 is two independent apps sharing one data source.

```
src/data/lineup.json  ←── single source of truth (80 artists)
       │
       ├──→  Web (Next.js)     reads at build time / server components
       └──→  Android (Compose) bundled as assets/lineup.json
```

Neither runtime calls the other. Data sync is manual: edit `src/data/lineup.json`, run the pipeline, copy the output to `android/app/src/main/assets/lineup.json`.

---

## Web (Next.js 16)

### Request lifecycle
```
Browser request
  → Next.js App Router (src/app/)
  → Server Component reads src/data/lineup.json directly (no API call)
  → Renders HTML + hydrates React 19 on client
  → Client state (favorites) persisted in localStorage
```

### Directory map

| Path | Purpose |
|------|---------|
| `src/app/` | All routes (App Router). Each folder = one route segment. |
| `src/app/api/` | API routes: Spotify OAuth (`auth/spotify/`), Spotify match (`spotify/matches`), Spotify playlist builder (`spotify/build-playlist`), weather proxy (`weather/`) |
| `src/ai/` | Genkit configuration and flows |
| `src/ai/flows/recommend-artists-flow.ts` | Main AI flow: mood prompt → up to 5 artist matches |
| `src/ai/genkit.ts` | Genkit instance with `googleai/gemini-2.5-flash` |
| `src/components/` | Shared React components |
| `src/data/` | JSON data files — do not put logic here |
| `src/data/lineup.json` | **Primary source of truth** for all lineup data |
| `src/hooks/` | Client-side hooks (favorites, hydration state) |
| `src/lib/firebase.ts` | Firebase config (favorites persistence, optional) |
| `src/lib/spotify.ts` | Spotify OAuth helpers |
| `src/types/index.ts` | Shared TypeScript interfaces: `LineupItem`, `MapPin` |
| `scripts/` | Data pipeline scripts (Node.js, run via npm scripts) |

### AI (Genkit)
The AI recommendation flow (`src/ai/flows/recommend-artists-flow.ts`) works by:
1. Accepting a free-text mood/preference string from the user
2. Injecting the full `lineup.json` array as context into the Gemini prompt
3. Returning up to 5 artist IDs with justifications

The flow does **not** call external music APIs — it reasons purely from the lineup data (genres, vibes, descriptions). Requires `GOOGLE_GENAI_API_KEY`.

### Data persistence
Web app uses `localStorage` for all user state. No database, no accounts. Keys:
- Favorites stored as a set of artist IDs
- The Firebase integration (`src/lib/firebase.ts`) is optional and can be used as an alternative persistence layer

### Key routes
| Route | Type | Notes |
|-------|------|-------|
| `/` | Server Component | Home — countdown, headliners, mood |
| `/discover` | Client Component | Artist grid, filters, search, Spotify matcher + playlist builder |
| `/artist/[id]` | Server Component | Static at build time for all 80 artists. Includes Spotify iframe embed. |
| `/map` | Client Component | POI map |
| `/timetable` | Client Component | Schedule grid (times TBD when data available) |
| `/food` | Client Component | Food vendor list with dietary filters |
| `/tools` | Client Component | Converter, weather forecast, SOS, packing list |
| `/api/auth/spotify/` | API Route | OAuth start |
| `/api/auth/spotify/callback` | API Route | OAuth callback |
| `/api/spotify/matches` | API Route | Match Spotify library against lineup |
| `/api/spotify/build-playlist` | API Route | POST — create playlist from matched artist IDs |
| `/api/weather` | API Route | Proxy for Open-Meteo Budapest forecast, 30-min cache |

---

## Android (Jetpack Compose)

### MVVM layers
```
Composable (UI)
    ↓ collectAsStateWithLifecycle()
ViewModel (state + business logic)
    ↓ suspend functions
Repository (data access)
    ↓
Assets (JSON via context.assets) + Room DB (SQLite)
```

### Data flow for artist browsing
```
LineupRepository.getArtists()       # reads lineup.json from assets
    → DiscoverViewModel             # applies filters: day, genre, vibe, country, search
    → StateFlow<List<Artist>>
    → DiscoverScreen                # renders filtered list via LazyVerticalGrid
    → ArtistCard                    # individual artist card with favorite toggle
    → ArtistViewModel.toggleFavorite()  # writes FavoriteArtist to Room
```

### Data flow for user progress
```
```

### Room Database (version 2)
Two entities only:
- `FavoriteArtist` — one row per favorited artist, keyed by `artistId`

Accessed via `UserDao`. Database singleton at `AppDatabase.getDatabase(context)`.

`Converters.kt` handles `List<String>` ↔ JSON string for Room columns.

**`fallbackToDestructiveMigration()`** is active — schema changes wipe data in dev builds. Increment `version` in `@Database` annotation for every entity change.

### Repositories
| Repository | Source | Returns |
|-----------|--------|---------|
| `LineupRepository` | `lineup.json` / `lineup_2025.json` (assets) | `List<Artist>` |
| `POIRepository` | `poi.json` (assets) | `List<POI>` |
| `FoodRepository` | `food.json` (assets) | `List<FoodVendor>` |
| `WeatherRepository` | Open-Meteo API (network) | `WeatherData` |

All repositories: coroutine-based, `Dispatchers.IO`, graceful empty-list / fallback on failure. `WeatherRepository` has a 30-minute in-memory cache.

### Navigation (Navigation.kt)

See `android/README.md` for the full route table.

---

## Shared data schema

### Artist (lineup.json)

```typescript
{
  id: string,              // "1" through "80" — stable identifier
  artist: string,          // Display name (may contain Unicode)
  countryCode: string,     // ISO 3166-1 alpha-2, e.g. "GB", "FR"
  day: string | null,      // "Wednesday"–"Tuesday" (Aug 6–12). null = unscheduled
  stage: null,             // NOT YET AVAILABLE — always null
  startTime: null,         // NOT YET AVAILABLE — always null
  endTime: null,           // NOT YET AVAILABLE — always null
  genres: string[],        // 2–8 genres, e.g. ["TECHNO", "ELECTRONIC"]
  vibes: string[],         // mood tags, e.g. ["Dance", "Hard", "Rave"] — 100% populated
  imageUrl: string,        // CDN URL (appmiral.com), 1440px width
  description: string,     // Artist bio — present for 75/80 artists
  szigetUrl: string,       // Link to artist page on szigetfestival.com
  isHeadliner: boolean,    // true for 6 artists
  socials: {
    website?: string, facebook?: string, instagram?: string,
    x?: string, twitter?: string, tiktok?: string,
    youtube?: string, spotify?: string, appleMusic?: string, soundcloud?: string
  }
}
```

**Coverage notes for feature planning:**
- `day` is populated for ~53% of artists (42/80). Features that group by day will have an "UNSCHEDULED" bucket.
- `stage`/`startTime`/`endTime` are always `null`. Do not build UI that assumes these exist.
- `vibes` is now 100% — the backfill script (`scripts/backfill-vibes.mjs`) infers vibes from genres for artists that had none.

### POI (poi.json)
8 points of interest. Types: `water`, `toilet`, `first-aid`, `camping`. Coords: `{x, y}` normalized 0–100.

### FoodVendor (food.json)
10 placeholder vendors. Fields: name, cuisine, tags, priceRange, budgetOption, budgetPrice, mapCoords. **Not real 2026 data yet.**

---

## What is NOT in this codebase

- No backend server
- No real-time data (no WebSockets, no polling)
- No user accounts or authentication (web: localStorage; Android: Room local only)
- No GPS-based map positioning — Android map uses normalized abstract coordinates (0–100). `TentFinderCard` does use GPS but only to mark a saved location, not to position on the map.
- No push notifications (WorkManager integration planned)
- No Spotify OAuth on Android — the web has a full OAuth flow; Android only has a WebView embed for the artist Spotify player
- No stage/schedule data (Sziget hasn't published it yet)
