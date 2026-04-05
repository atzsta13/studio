# Data Pipeline

Each festival requires a **data package** — four JSON files (lineup, POI, food, guide) plus visual assets. This document covers the schemas, the scraper architecture, the vibe taxonomy expansion, and the npm scripts that orchestrate the full pipeline.

---

## Festival Data Package Structure

```
festivals/
├── sziget-2026/
│   ├── data/
│   │   ├── lineup.json      ← artist records with vibes, genres, days
│   │   ├── poi.json         ← points of interest (stages, toilets, etc.)
│   │   ├── food.json        ← food and drink vendors
│   │   └── guide.json       ← survival guide sections + tips
│   └── assets/
│       ├── map.svg          ← venue map (SVG preferred)
│       ├── icon-192.png     ← PWA / app icon
│       ├── icon-512.png
│       └── og-image.png     ← 1200×630 Open Graph image
├── area53-2026/
│   └── ... (same structure)
├── novarock-2026/
│   └── ...
└── frequency-2026/
    └── ...
```

At build time, `scripts/sync-data.mjs` copies the selected festival's `data/` directory into `src/data/` and its `assets/` into `public/`. On Android, per-flavor source sets (`android/app/src/<flavor>/assets/`) are bundled by Gradle automatically.

---

## Schemas

### `lineup.json`

Each element represents one artist appearing at the festival.

```typescript
interface LineupItem {
  /** URL-safe unique ID, e.g. "bring-me-the-horizon" */
  id: string
  /** Display name, e.g. "Bring Me the Horizon" */
  artist: string
  /** Stage name. null until official schedule published. */
  stage: string | null
  /** Day name matching FestivalConfig.dates.days entries. null until confirmed. */
  day: string | null
  /** ISO 8601 time string, e.g. "21:30". null until schedule published. */
  startTime: string | null
  endTime: string | null
  isHeadliner: boolean
  /** ISO 3166-1 alpha-2, e.g. "GB", "DE". */
  countryCode?: string
  /** Genre tags as provided by the festival/scraper, e.g. ["Metal", "Metalcore"]. */
  genres?: string[]
  /** Computed vibe tags from backfill-vibes.mjs, e.g. ["Heavy", "Aggressive"]. */
  vibes?: string[]
  /** Link to the artist's page on the official festival website. */
  festivalUrl?: string
  /** Artist photo URL. May be from festival CDN or a placeholder. */
  imageUrl?: string
  socials?: {
    spotify?: string
    /** Spotify artist ID — used for Spotify matching feature. */
    spotifyId?: string
    appleMusic?: string
    instagram?: string
    youtube?: string
    website?: string
  }
  description?: string
  bio?: string
  /** True if the artist performed at the previous year's edition. */
  returningHero?: boolean
  lastYearStage?: string
  /**
   * Frequency-specific: separates Daypark (rock/indie) from Nightpark (electronic).
   * null for all other festivals.
   */
  timeSlot?: 'daypark' | 'nightpark' | null
}
```

> **Migration note**: The existing `src/data/lineup.json` uses `szigetUrl` as the festival URL field. Rename to `festivalUrl` across all records. See `04_WEB_IMPLEMENTATION.md` for the type change.

### `poi.json`

Points of interest displayed on the map screen.

```typescript
interface POI {
  id: string
  name: string
  /** Category controls the map icon and filter chip. */
  category: 'stage' | 'food' | 'water' | 'medical' | 'toilet' | 'atm' | 'info' | 'camping' | 'exit'
  /**
   * Percentage-based coordinates on the venue map image.
   * x=0 is left edge, x=100 is right edge; y=0 is top.
   */
  mapCoords: { x: number; y: number }
  description?: string
  openHours?: string
}
```

**Example entries:**
```json
[
  { "id": "stage-main",   "name": "Main Stage",   "category": "stage",   "mapCoords": { "x": 42, "y": 48 } },
  { "id": "medical-1",    "name": "Medical A",     "category": "medical", "mapCoords": { "x": 18, "y": 22 } },
  { "id": "water-1",      "name": "Free Water",    "category": "water",   "mapCoords": { "x": 55, "y": 60 } },
  { "id": "toilet-main",  "name": "Toilets North", "category": "toilet",  "mapCoords": { "x": 30, "y": 15 } }
]
```

### `food.json`

Food and drink vendors, used by the Food screen and Map food filter.

```typescript
interface FoodVendor {
  id: string
  name: string
  /** Human-readable location description, e.g. "Food Court A" or "Near Main Stage". */
  location: string
  mapCoords?: { x: number; y: number }
  categories: ('food' | 'drink' | 'dessert' | 'coffee')[]
  /** Dietary flags for filtering. */
  dietary: ('vegan' | 'vegetarian' | 'gluten-free' | 'halal' | 'kosher')[]
  priceRange: 'budget' | 'mid' | 'premium'
  /** ISO 4217 currency code. Should match FestivalConfig.currency.localCode. */
  currency: string
  description?: string
  specialties?: string[]
}
```

### `guide.json`

Survival guide content rendered in the Guide screen.

```typescript
interface GuideTip {
  id: string
  text: string
  /** Controls visual emphasis in the UI. */
  importance: 'critical' | 'high' | 'medium' | 'low'
  tags?: string[]
}

interface GuideSection {
  id: string
  title: string
  /** Lucide icon name, e.g. "MapPin", "Shield", "Tent". */
  icon: string
  tips: GuideTip[]
}

// guide.json is an array of GuideSection
type GuideJson = GuideSection[]
```

**Example structure:**
```json
[
  {
    "id": "arrival",
    "title": "Getting There",
    "icon": "Train",
    "tips": [
      {
        "id": "arrival-1",
        "text": "Train from Vienna to Leoben takes ~2.5 hours. Direct services from Graz take ~1 hour.",
        "importance": "high"
      }
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency",
    "icon": "Shield",
    "tips": [
      { "id": "em-1", "text": "European emergency number: 112", "importance": "critical" },
      { "id": "em-2", "text": "Austrian police: 133 · Ambulance: 144 · Fire: 122", "importance": "critical" }
    ]
  }
]
```

---

## Vibe Taxonomy

`scripts/vibe-taxonomy.mjs` is the single source of truth for genre → vibe mappings. All festivals share the same taxonomy file; the relevant genres in each festival's lineup determine which vibes actually appear in practice.

### Current Taxonomy (Sziget-tuned, to be expanded)

```javascript
// scripts/vibe-taxonomy.mjs
export const VIBE_TAXONOMY = {
  // ── Electronic ──────────────────────────────────────────────────────────
  TECHNO:          ['Dance', 'Hard', 'Rave', 'Dark'],
  HOUSE:           ['Dance', 'Feel-Good', 'Uplifting'],
  TRANCE:          ['Dance', 'Uplifting', 'Euphoric'],
  DRUM_AND_BASS:   ['Dance', 'Fast', 'Energetic', 'Dark'],
  AMBIENT:         ['Chill', 'Atmospheric', 'Introspective'],
  EDM:             ['Dance', 'Uplifting', 'Mainstream'],
  TRAP:            ['Urban', 'Hype', 'Bass'],
  FUTURE_BASS:     ['Uplifting', 'Melodic', 'Dance'],
  HYPERPOP:        ['Eclectic', 'Intense', 'Energetic'],

  // ── Rock / Guitar ────────────────────────────────────────────────────────
  ROCK:            ['Raw', 'Energetic', 'Guitar'],
  INDIE:           ['Chill', 'Atmospheric', 'Melodic'],
  PUNK:            ['Raw', 'Aggressive', 'Fast'],
  ALTERNATIVE:     ['Raw', 'Eclectic', 'Guitar'],
  GRUNGE:          ['Raw', 'Heavy', 'Atmospheric'],
  EMOCORE:         ['Emotional', 'Intense', 'Guitar'],

  // ── Metal ────────────────────────────────────────────────────────────────
  METAL:           ['Heavy', 'Energetic', 'Intense'],
  HEAVY_METAL:     ['Heavy', 'Energetic', 'Intense'],
  DEATH_METAL:     ['Brutal', 'Dark', 'Intense', 'Heavy'],
  BLACK_METAL:     ['Dark', 'Atmospheric', 'Intense', 'Raw'],
  THRASH_METAL:    ['Aggressive', 'Fast', 'Raw', 'Energetic'],
  POWER_METAL:     ['Epic', 'Anthemic', 'Melodic', 'Fast'],
  GOTHIC_METAL:    ['Dark', 'Atmospheric', 'Haunting', 'Emotional'],
  DOOM_METAL:      ['Heavy', 'Slow', 'Dark', 'Crushing'],
  PROGRESSIVE_METAL: ['Complex', 'Melodic', 'Technical', 'Atmospheric'],
  SYMPHONIC_METAL: ['Epic', 'Orchestral', 'Dramatic', 'Melodic'],
  GROOVE_METAL:    ['Heavy', 'Rhythmic', 'Aggressive', 'Energetic'],
  METALCORE:       ['Aggressive', 'Melodic', 'Intense', 'Heavy'],
  FOLK_METAL:      ['Energetic', 'Cultural', 'Melodic', 'Fun'],
  SPEED_METAL:     ['Fast', 'Aggressive', 'Energetic', 'Raw'],
  HARDCORE:        ['Aggressive', 'Raw', 'Intense', 'Fast'],
  STONER_METAL:    ['Heavy', 'Slow', 'Hazy', 'Riff-driven'],

  // ── Pop ──────────────────────────────────────────────────────────────────
  POP:             ['Feel-Good', 'Uplifting', 'Mainstream'],
  INDIE_POP:       ['Melodic', 'Chill', 'Feel-Good'],
  DREAM_POP:       ['Atmospheric', 'Chill', 'Introspective'],
  HYPERPOP_POP:    ['Eclectic', 'Energetic', 'Experimental'],
  SINGER_SONGWRITER: ['Emotional', 'Acoustic', 'Intimate'],

  // ── Hip-Hop / R&B ────────────────────────────────────────────────────────
  HIP_HOP:         ['Urban', 'Hype', 'Rhythmic'],
  RAP:             ['Urban', 'Rhythmic', 'Lyrically Dense'],
  RNB:             ['Soulful', 'Smooth', 'Groove'],
  AFROBEATS:       ['Dance', 'Cultural', 'Groove'],

  // ── World / Folk ─────────────────────────────────────────────────────────
  WORLD_MUSIC:     ['Eclectic', 'Cultural', 'Laid-Back'],
  FOLK:            ['Acoustic', 'Emotional', 'Storytelling'],
  REGGAE:          ['Laid-Back', 'Feel-Good', 'Groove'],

  // ── Jazz / Blues / Soul ──────────────────────────────────────────────────
  JAZZ:            ['Chill', 'Sophisticated', 'Improvisational'],
  BLUES:           ['Emotional', 'Acoustic', 'Raw'],
  SOUL:            ['Soulful', 'Emotional', 'Groove'],
  FUNK:            ['Groove', 'Dance', 'Feel-Good'],

  // ── Classical / Experimental ─────────────────────────────────────────────
  CLASSICAL:       ['Sophisticated', 'Dramatic', 'Emotional'],
  NOISE:           ['Intense', 'Aggressive', 'Experimental'],
}
```

---

## Scripts

### `scripts/sync-data.mjs` (new file)

Copies the correct festival data package into the web `src/data/` and `public/` directories before building.

```javascript
// scripts/sync-data.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const src = path.join('festivals', festivalId, 'data')
const dest = path.join('src', 'data')

if (!fs.existsSync(src)) {
  console.error(`Festival data directory not found: ${src}`)
  process.exit(1)
}

// Copy JSON data files
for (const file of fs.readdirSync(src)) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file))
    console.log(`✓ Synced ${file}`)
  }
}

// Copy map asset if present
const mapSrc = path.join('festivals', festivalId, 'assets', 'map.svg')
const mapDest = path.join('public', 'map.svg')
if (fs.existsSync(mapSrc)) {
  fs.copyFileSync(mapSrc, mapDest)
  console.log('✓ Synced map.svg')
}

console.log(`Data package synced for: ${festivalId}`)
```

### `scripts/generate-manifest.mjs` (new file)

Generates `public/manifest.json` from the festival config at build time.

```javascript
// scripts/generate-manifest.mjs
import fs from 'fs'

// Inline festival configs to avoid needing ts-node
const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'

const CONFIGS = {
  'sziget-2026': {
    appName: 'Sziget Insider 2026',
    name: 'Sziget',
    description: 'Your unofficial offline-first guide to Sziget Festival 2026.',
    primaryHex: '#FF0080',
    backgroundHex: '#09090B',
  },
  'area53-2026': {
    appName: 'Area 53 Insider 2026',
    name: 'Area 53',
    description: 'Your unofficial guide to Area 53 Metal Festival 2026.',
    primaryHex: '#CC0000',
    backgroundHex: '#09090B',
  },
  'novarock-2026': {
    appName: 'Nova Rock Insider 2026',
    name: 'Nova Rock',
    description: 'Your unofficial discovery guide to Nova Rock Festival 2026.',
    primaryHex: '#FF6600',
    backgroundHex: '#09090B',
  },
  'frequency-2026': {
    appName: 'Frequency Insider 2026',
    name: 'Frequency',
    description: 'Your unofficial guide to FM4 Frequency Festival 2026.',
    primaryHex: '#8B00FF',
    backgroundHex: '#09090B',
  },
}

const config = CONFIGS[festivalId]
if (!config) {
  console.error(`Unknown FESTIVAL_ID: ${festivalId}`)
  process.exit(1)
}

const manifest = {
  name: config.appName,
  short_name: config.name,
  description: config.description,
  theme_color: config.primaryHex,
  background_color: config.backgroundHex,
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  icons: [
    { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
}

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2))
console.log(`✓ Generated manifest.json for: ${festivalId}`)
```

### `scripts/backfill-vibes.mjs` (updated)

Updated to accept a `--festival` argument and write to the correct festivals/ directory:

```javascript
// scripts/backfill-vibes.mjs
import fs from 'fs'
import path from 'path'
import { VIBE_TAXONOMY } from './vibe-taxonomy.mjs'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const lineupPath = path.join('festivals', festivalId, 'data', 'lineup.json')

if (!fs.existsSync(lineupPath)) {
  // Fallback to legacy path for backward compatibility
  const legacyPath = path.join('src', 'data', 'lineup.json')
  if (!fs.existsSync(legacyPath)) {
    console.error(`lineup.json not found at ${lineupPath} or ${legacyPath}`)
    process.exit(1)
  }
  console.warn(`Using legacy path: ${legacyPath}`)
}

const lineup = JSON.parse(fs.readFileSync(lineupPath, 'utf8'))

function genrestoVibes(genres) {
  const vibes = new Set()
  for (const genre of genres ?? []) {
    const normalized = genre.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const mapped = VIBE_TAXONOMY[normalized]
    if (mapped) mapped.forEach(v => vibes.add(v))
  }
  return [...vibes]
}

const updated = lineup.map(artist => ({
  ...artist,
  vibes: artist.vibes?.length ? artist.vibes : genrestoVibes(artist.genres),
}))

fs.writeFileSync(lineupPath, JSON.stringify(updated, null, 2))
console.log(`✓ Vibes backfilled for ${updated.length} artists (${festivalId})`)
```

### `scripts/sync-android-assets.mjs` (new file)

Copies festival data JSON files to the correct Android flavor assets directory:

```javascript
// scripts/sync-android-assets.mjs
import fs from 'fs'
import path from 'path'

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const slug = festivalId.replace(/-\d{4}$/, '') // "sziget-2026" → "sziget"
const srcDir = path.join('festivals', festivalId, 'data')
const destDir = path.join('android', 'app', 'src', slug, 'assets')

fs.mkdirSync(destDir, { recursive: true })

for (const file of fs.readdirSync(srcDir)) {
  if (file.endsWith('.json')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file))
    console.log(`✓ Synced ${file} → android/app/src/${slug}/assets/`)
  }
}
console.log(`Android assets synced for: ${festivalId}`)
```

---

## Updated `package.json` Scripts

```json
{
  "scripts": {
    "dev": "npm run lineup:sync && next dev --port 9002",
    "build": "npm run lineup:sync && node scripts/generate-manifest.mjs && next build",
    "lineup:sync": "node scripts/sync-data.mjs",
    "lineup:scrape": "node src/scripts/scrape_all_artists.js",
    "lineup:clean": "node src/scripts/clean_lineup.js",
    "lineup:vibes": "node scripts/backfill-vibes.mjs",
    "lineup:sync-android": "node scripts/sync-android-assets.mjs",
    "lineup:update": "npm run lineup:scrape && npm run lineup:clean && npm run lineup:vibes && npm run lineup:sync",
    "lineup:update:sziget":    "NEXT_PUBLIC_FESTIVAL_ID=sziget-2026   npm run lineup:update",
    "lineup:update:area53":    "NEXT_PUBLIC_FESTIVAL_ID=area53-2026   npm run lineup:update",
    "lineup:update:novarock":  "NEXT_PUBLIC_FESTIVAL_ID=novarock-2026  npm run lineup:update",
    "lineup:update:frequency": "NEXT_PUBLIC_FESTIVAL_ID=frequency-2026 npm run lineup:update",
    "android:sync:sziget":     "NEXT_PUBLIC_FESTIVAL_ID=sziget-2026   npm run lineup:sync-android",
    "android:sync:area53":     "NEXT_PUBLIC_FESTIVAL_ID=area53-2026   npm run lineup:sync-android",
    "android:sync:novarock":   "NEXT_PUBLIC_FESTIVAL_ID=novarock-2026  npm run lineup:sync-android",
    "android:sync:frequency":  "NEXT_PUBLIC_FESTIVAL_ID=frequency-2026 npm run lineup:sync-android"
  }
}
```

---

## Scraper Architecture

The scraper needs a config per festival website. The shared `scrape_all_artists.js` reads the target URL and CSS selectors from `SCRAPER_CONFIGS`:

```javascript
// src/scripts/scrape_all_artists.js (updated excerpt)
const SCRAPER_CONFIGS = {
  'sziget-2026': {
    baseUrl: 'https://szigetfestival.com/en/programs-lineup-2026',
    artistSelector: '.lineup-artist__name',
    imageSelector: '.lineup-artist__image img',
    urlSelector: 'a.lineup-artist',
    festivalUrlBase: 'https://szigetfestival.com',
  },
  'area53-2026': {
    baseUrl: 'https://area53festival.at/en/lineup',
    artistSelector: '.artist-name',
    imageSelector: '.artist-image img',
    urlSelector: 'a.artist-link',
    festivalUrlBase: 'https://area53festival.at',
  },
  'novarock-2026': {
    baseUrl: 'https://www.novarock.at/en/lineup/',
    artistSelector: '.band-name',
    imageSelector: '.band-image img',
    urlSelector: 'a.band-link',
    festivalUrlBase: 'https://www.novarock.at',
  },
  'frequency-2026': {
    baseUrl: 'https://www.frequency.at/en/lineup',
    artistSelector: '.lineup__artist-name',
    imageSelector: '.lineup__artist-image img',
    urlSelector: 'a.lineup__artist',
    festivalUrlBase: 'https://www.frequency.at',
  },
}

const festivalId = process.env.NEXT_PUBLIC_FESTIVAL_ID ?? 'sziget-2026'
const config = SCRAPER_CONFIGS[festivalId]
// ... rest of scraper uses config selectors
```

> **Note**: CSS selectors are estimates. Verify against the live HTML of each festival website before running. Festival websites often update their markup between editions.

---

## Data Quality Checklist Per Festival

Before deploying a new festival, verify:

- [ ] All artists have an `id` (URL-safe slug, no spaces)
- [ ] All artists have a `name`
- [ ] `isHeadliner` set correctly for top-billed acts
- [ ] `genres` populated (even if only 1–2 per artist)
- [ ] `vibes` backfilled via `lineup:vibes` script
- [ ] `festivalUrl` populated (links to official artist page)
- [ ] `day` is null (or correctly set if schedule published)
- [ ] `stage` is null (or correctly set if schedule published)
- [ ] No duplicate `id` values (`jq '[.[].id] | group_by(.) | map(select(length>1))' lineup.json`)
- [ ] POI coordinates look correct (spot-check main stage, medical, toilets)
- [ ] Food vendors have correct `currency` field matching FestivalConfig
- [ ] Guide emergency numbers are correct for the festival country
