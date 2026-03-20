# Data Models Dictionary

**Last updated:** 2026-03-20
**Scope:** All data types used in lineup.json, databases, and API responses
**Format:** JSON + Kotlin + TypeScript equivalents

---

## TLDR

- **Source of truth:** `src/data/lineup.json` (80 artists)
- **Schema:** Artist, Socials, MapCoords, FoodVendor, POI, WeatherData
- **DB:** Room with UserProgress + FavoriteArtist
- **Nullability:** Many fields are optional (stage/time data pending)

---

## Table of Contents

1. [Artist (Lineup)](#artist-lineup)
2. [Socials](#socials)
3. [User Progress](#user-progress)
4. [Favorite Artist](#favorite-artist)
5. [POI (Point of Interest)](#poi-point-of-interest)
6. [Food Vendor](#food-vendor)
7. [Weather Data](#weather-data)
8. [Map Coordinates](#map-coordinates)
9. [Relationships](#relationships)

---

## Artist (Lineup)

**Source:** `src/data/lineup.json` (80 items)
**Used by:** Every page + Android + Web
**Stored in:** Memory (JSON asset in Android), Server components (Web)

### JSON Schema

```json
{
  "id": "1",                           // Unique identifier
  "artist": "Afrojack",                // Display name (may include Unicode)
  "stage": null,                       // ❌ NULL — not yet published by Sziget
  "day": "Thursday",                   // Festival day (Wednesday–Tuesday) or null
  "startTime": null,                   // ❌ NULL — not yet published
  "endTime": null,                     // ❌ NULL — not yet published
  "countryCode": "NL",                 // ISO 3166-1 alpha-2
  "genres": [                          // Always populated
    "MUSIC",
    "ELECTRONIC",
    "HOUSE",
    "TECHNO"
  ],
  "szigetUrl": "https://szigetfestival.com/en/programs-lineup-2026#/...",
  "socials": {
    "website": "https://afrojack.com",
    "facebook": "https://facebook.com/afrojack",
    "instagram": "https://instagram.com/afrojack",
    "twitter": null,
    "x": null,
    "tiktok": "https://tiktok.com/@afrojack",
    "youtube": "https://youtube.com/@Afrojack",
    "spotify": "https://open.spotify.com/artist/0I2XqVXqHScXjSH0JDtIqf",
    "appleMusic": "https://music.apple.com/us/artist/afrojack/123456",
    "soundcloud": null
  },
  "description": "Dutch DJ/producer known for house and EDM...",
  "imageUrl": "https://media.appmiral.com/prod/...",
  "vibes": [                           // Always populated (backfilled)
    "Dance",
    "Energy",
    "Electronic"
  ],
  "isHeadliner": true
}
```

### Field Details

| Field | Type | Nullable | Example | Used By | Notes |
|-------|------|----------|---------|---------|-------|
| `id` | string | ❌ No | `"42"` | Everywhere (primary key) | Always "1"–"80" |
| `artist` | string | ❌ No | `"KAYTRANADA"` | All screens | May contain Unicode (Japanese names, etc.) |
| `stage` | string \| null | ✅ Yes | `null` | Schedule (when available) | **Pending data** — currently always null |
| `day` | string \| null | ✅ Yes | `"Friday"` | Discover (day filter), Highlights (grouping) | One of: Wednesday–Tuesday, or null for unknown |
| `startTime` | string \| null | ✅ Yes | `null` | Timetable, Clash detection | **Pending data** — HH:MM format when available |
| `endTime` | string \| null | ✅ Yes | `null` | Timetable, Clash detection | **Pending data** — HH:MM format when available |
| `countryCode` | string \| null | ✅ Yes | `"SE"` | Country explorer, Artist detail | ISO 3166-1 alpha-2 (GB, FR, US, etc.) |
| `genres` | string[] | ❌ No | `["MUSIC", "ROCK"]` | Discover (filter), AI recommendations | Always has ≥1 item; starts with "MUSIC" |
| `szigetUrl` | string \| null | ✅ Yes | Full URL | Artist detail (source link) | Links to Sziget official lineup |
| `socials` | Socials | ❌ No | {…} | Artist detail | See [Socials](#socials) section |
| `description` | string \| null | ✅ Yes | "Dutch DJ known for..." | Artist detail (bio section) | ~200–500 chars, truncated in previews |
| `imageUrl` | string \| null | ✅ Yes | HTTPS URL | Artist card (cover), grid, detail | Loaded via Coil on Android, `<Image>` on Web |
| `vibes` | string[] | ❌ No | `["Dance", "Flow"]` | Discover (vibe filter), AI rec | Always populated (backfilled via script if missing) |
| `isHeadliner` | boolean | ❌ No | `true` | Discover (sort), Home (feed) | Headliners appear first when "HEADLINERS FIRST" sort active |

### Derived Properties

```typescript
// Web (TypeScript)
type LineupItem = Artist & {
  spotifyId?: string;  // Extracted from socials.spotify URL
};

// Android (Kotlin)
val spotifyId: String?
  get() = socials?.spotify
    ?.split("/artist/")?.getOrNull(1)
    ?.split("?")?.firstOrNull()
```

### When Fields Are Required

| Field | Required for | Notes |
|-------|--------------|-------|
| `id` | Unique identification | Must never be null; used as primary key everywhere |
| `artist` | Display | Must never be null; shown on every screen |
| `genres` | Filtering, AI | Must never be empty |
| `vibes` | Filtering | Must never be empty |
| `imageUrl` | Display | Null → show placeholder; don't crash |
| `countryCode` | Country filter | Null → artist not filterable by country |
| `stage`, `startTime`, `endTime` | Schedule (pending) | Null → schedule feature disabled |

---

## Socials

**Parent:** Artist
**Purpose:** Links to external music platforms + artist social media

### JSON Schema

```json
{
  "website": "https://afrojack.com" | null,
  "facebook": "https://facebook.com/afrojack" | null,
  "instagram": "https://instagram.com/afrojack" | null,
  "twitter": "https://twitter.com/afrojack" | null,
  "x": "https://x.com/afrojack" | null,       // Newer Twitter
  "tiktok": "https://tiktok.com/@afrojack" | null,
  "youtube": "https://youtube.com/@Afrojack" | null,
  "spotify": "https://open.spotify.com/artist/0I2XqVXqHScXjSH0JDtIqf" | null,
  "appleMusic": "https://music.apple.com/us/artist/afrojack/..." | null,
  "soundcloud": "https://soundcloud.com/afrojack" | null
}
```

### Field Details

| Field | Icon | Used By | Notes |
|-------|------|---------|-------|
| `website` | 🌐 | Artist detail | Official artist website |
| `facebook` | f | Artist detail | Social media link |
| `instagram` | 📷 | Artist detail | Most common social platform |
| `twitter` | 𝕏 | Artist detail | X (formerly Twitter) |
| `x` | 𝕏 | Artist detail | New X platform link |
| `tiktok` | 🎵 | Artist detail | Short-form video |
| `youtube` | ▶️ | Artist detail | Music videos, live performances |
| `spotify` | 🎵 | Artist detail, Spotify match | **Critical:** Used to extract spotifyId |
| `appleMusic` | 🎵 | Artist detail | iOS ecosystem |
| `soundcloud` | ☁️ | Artist detail | Electronic music platform |

### Extracting Spotify ID

```typescript
// From socials.spotify URL → extract artist ID
const url = "https://open.spotify.com/artist/0I2XqVXqHScXjSH0JDtIqf?utm_source=..."
const spotifyId = url
  .split("/artist/")[1]          // "0I2XqVXqHScXjSH0JDtIqf?utm_source=..."
  .split("?")[0]                 // "0I2XqVXqHScXjSH0JDtIqf"
```

---

## User Progress

**Storage:** Room Database (singleton row, id=1)
**Used by:** Passport screen, Challenge engine, Highlights

### Schema

```kotlin
@Entity(tableName = "user_progress")
data class UserProgress(
  @PrimaryKey
  val id: Int = 1,
  val legendXp: Int = 0,
  val currentRank: String = "Tourist",
  @TypeConverters(Converters::class)
  val stampsCollected: List<String> = emptyList(),
  val completedChallengeIds: String = "",  // Comma-separated
  val quizCompleted: Boolean = false
)
```

### Field Details

| Field | Type | Range | Used By | Notes |
|-------|------|-------|---------|-------|
| `id` | Int | Always 1 | — | Singleton row (only one user progress record) |
| `legendXp` | Int | 0–∞ | Passport, Highlights | Cumulative XP; used to determine rank |
| `currentRank` | String | See enum | Passport, Widget | "Tourist" → "Scout" → "Legend" (or more) |
| `stampsCollected` | List\<String\> | 0–8 | Passport (stamps tab) | Stamp IDs: "s1", "s2", ..., "s8" |
| `completedChallengeIds` | String | CSV | Challenge engine | Prevents duplicate XP awards |
| `quizCompleted` | Boolean | true/false | Discover | Whether user completed Vibe Quiz at least once |

### Rank Progression

```kotlin
enum class Rank(val requiredXp: Int) {
  TOURIST(0),
  ISLAND_SCOUT(100),
  FESTIVAL_GUIDE(300),
  LEGEND(500)
}
```

---

## Favorite Artist

**Storage:** Room Database (one row per favorited artist)
**Used by:** Discover, Highlights, Passport

### Schema

```kotlin
@Entity(tableName = "favorite_artists")
data class FavoriteArtist(
  @PrimaryKey
  val artistId: String,
  val timestamp: Long = System.currentTimeMillis()
)
```

### Field Details

| Field | Type | Notes |
|-------|------|-------|
| `artistId` | String (PK) | Matches `Artist.id` from lineup.json |
| `timestamp` | Long | When user favorited this artist (milliseconds since epoch) |

### Queries

```kotlin
// Get all favorite artist IDs
val favoriteIds: Flow<Set<String>> = userDao.getAllFavoriteIds()

// Toggle favorite
suspend fun toggleFavorite(artistId: String) {
  val exists = userDao.getFavorite(artistId) != null
  if (exists) userDao.deleteFavorite(artistId)
  else userDao.insertFavorite(FavoriteArtist(artistId))
}
```

---

## POI (Point of Interest)

**Source:** `android/app/src/main/assets/poi.json`
**Used by:** Map screen, Tools screen

### Schema

```json
{
  "id": "water-1",
  "name": "Main Water Station",
  "type": "water",
  "mapCoords": { "x": 45, "y": 62 },
  "description": "Central refill point"
}
```

### Field Details

| Field | Type | Values | Icon | Color |
|-------|------|--------|------|-------|
| `id` | string | "water-N", "toilet-N", "first-aid-N", "camping" | — | — |
| `name` | string | "Main Water Station" | — | — |
| `type` | string | "water", "toilet", "first-aid", "camping" | 💧, 🚽, 🏥, ⛺ | CyanPulse, AcidYellow, Red, Magenta |
| `mapCoords` | MapCoords | {x: 0–100, y: 0–100} | — | — |
| `description` | string | Optional notes | — | — |

---

## Food Vendor

**Source:** `android/app/src/main/assets/food.json`
**Used by:** Food screen, Map screen

### Schema

```json
{
  "id": "food-1",
  "name": "Ramen House",
  "category": "food",
  "cuisineType": "Asian",
  "dietaryTags": ["VEGAN_OPTION"],
  "priceRange": "$$",
  "mapCoords": { "x": 30, "y": 55 }
}
```

### Field Details

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `id` | string | "food-1", "food-2", ... | Unique identifier |
| `name` | string | "Ramen House" | Display name |
| `category` | string | "food", "drink" | Filterable in Food screen |
| `cuisineType` | string | "Asian", "Italian", etc. | Optional; helps with recommendations |
| `dietaryTags` | string[] | "VEGAN_OPTION", "GLUTEN_FREE", "BUDGET_HERO" | Multi-select filtering |
| `priceRange` | string | "$", "$$", "$$$", "$$$$" | Visual indicator |
| `mapCoords` | MapCoords | {x: 0–100, y: 0–100} | Displayed on map |

---

## Weather Data

**Source:** `/api/weather` (Open-Meteo)
**Used by:** Tools screen, Weather card, Rain alert banner

### Schema

```json
{
  "daily": [
    {
      "date": "2026-03-20",
      "maxTemp": 18.5,
      "minTemp": 12.3,
      "precipProbability": 45,
      "weatherCode": 45
    }
  ],
  "rainAlert": true
}
```

### Field Details

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `daily` | DailyForecast[] | 7 items | Current day + 6 days forward |
| `date` | string | YYYY-MM-DD | ISO format, UTC timezone |
| `maxTemp` | float | –10 to 40 | Celsius |
| `minTemp` | float | –10 to 40 | Celsius |
| `precipProbability` | int | 0–100 | Percentage |
| `weatherCode` | int | 0–99 | WMO weather code (see table below) |
| `rainAlert` | boolean | true/false | True if next 24h has >60% rain probability |

### WMO Weather Codes

| Code | Condition | Icon |
|------|-----------|------|
| 0 | Clear sky | ☀️ |
| 1–3 | Partly cloudy | ⛅ |
| 45–48 | Foggy | 🌫️ |
| 51–67 | Drizzle/rain | 🌧️ |
| 80–82 | Rain showers | ⛈️ |
| 85–86 | Snow showers | ❄️ |

---

## Map Coordinates

**Used by:** Map screen, POI, Food vendors
**Purpose:** Normalized 2D position (0–100 on each axis)

### Schema

```json
{
  "x": 45,
  "y": 62
}
```

### Field Details

| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `x` | int | 0–100 | Horizontal (left=0, right=100) |
| `y` | int | 0–100 | Vertical (top=0, bottom=100) |

### Why Normalized (0–100)?

- Scales to any screen size without recalculation
- Decouples from actual map dimensions
- Easy to visualize: (50, 50) = center

---

## Relationships

### Data Flow: Artist → Favorite → Highlights

```
1. User browses Discover
   ↓
2. Taps ★ on artist → ArtistViewModel.toggleFavorite(id)
   ↓
3. Room inserts FavoriteArtist(artistId=id, timestamp=now)
   ↓
4. When viewing Highlights:
   HighlightsViewModel loads:
   - lineup.json (all 80 artists)
   - Room favorites (user's marked artists)
   - Joins them → shows only favorited artists
   ↓
5. Displays: favorite count, top genres, top vibes, artist list
```

### Data Flow: Artist → Schedule (When Available)

```
1. Sziget publishes stage/startTime/endTime
   ↓
2. Scripts update src/data/lineup.json
   ↓
3. Android copies to assets/lineup.json
   ↓
4. ScheduleScreen & TimetableView enabled:
   - Parse startTime/endTime → DateTime
   - Detect clashes (two favorites at same time)
   - Show schedule grid by day
```

### Data Flow: User Progress → Rank Badge

```
1. PassportScreen loads Room.getUserProgress()
   ↓
2. Shows:
   - legendXp (100 XP)
   - currentRank ("Island Scout")
   - Progress bar toward next rank
   ↓
3. Challenge engine evaluates user state:
   - Favorite 5 artists? → "Artist Devotee" challenge unlocked
   - Stamped all water stations? → Reward XP
   ↓
4. PassportViewModel.evaluateChallenges():
   - Compares completedChallengeIds vs. newly completed
   - Awards new XP
   - Updates currentRank if XP threshold crossed
   ↓
5. Widget displays updated rank badge
```

---

## TODO: Pending Fields

| Field | Model | Status | ETA |
|-------|-------|--------|-----|
| `stage` | Artist | ❌ Pending | TBA |
| `startTime` | Artist | ❌ Pending | TBA |
| `endTime` | Artist | ❌ Pending | TBA |
| Real food vendors | FoodVendor | ⏳ Partial | Sziget confirmation |
| Real POI locations | POI | ✅ Complete | Current assets |

---

## Related Files

- `src/data/lineup.json` — Source of truth
- `src/types/index.ts` — Web TypeScript definitions
- `android/app/src/main/java/com/example/szigerinsider2026/data/model/` — Android data classes
- `android/app/src/main/java/com/example/szigerinsider2026/data/local/AppDatabase.kt` — Room schema
- `scripts/backfill-vibes.mjs` — Generates vibes from genres if missing
