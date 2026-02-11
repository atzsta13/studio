# Lineup Data Management

This document explains how to update and maintain the Sziget 2026 lineup data.

## 📁 Data Structure

**Single Source of Truth:** `src/data/lineup.json`

Each artist object contains:
```json
{
  "id": "1",
  "artist": "Zara Larsson",
  "day": "Tuesday",           // Extracted from genres or null
  "stage": null,              // Set by Sziget when schedule announced
  "startTime": null,          // Set by Sziget when schedule announced  
  "endTime": null,            // Set by Sziget when schedule announced
  "countryCode": "SE",        // ISO 2-letter country code
  "genres": ["MUSIC", "POP"], // Music genres (days are auto-removed)
  "description": "...",       // Artist bio from Sziget
  "imageUrl": "...",          // Artist photo URL
  "szigetUrl": "...",         // Link to Sziget artist page
  "socials": { ... },         // Social media links
  "vibes": ["Sing-along"]     // Generated vibe tags
}
```

---

## 🚀 Quick Update (New Artists Announced)

When Sziget announces new artists, run:

```bash
npm run lineup:update
```

This runs the full pipeline:
1. **Scrape** - Fetches all artists from Sziget website
2. **Clean** - Dedupes, fixes encoding, extracts days, adds country codes
3. **Vibes** - Generates vibe tags based on genres
4. **Show** - Displays summary

---

## 📜 Scripts Reference

### `npm run lineup:scrape`
**File:** `src/scripts/scrape_all_artists.js`

Visits the Sziget lineup page, discovers all artists, and fetches their details:
- Artist name (from URL slug - handles image-based headliner names)
- Genres (including day tags like "THURSDAY")
- Description (auto-expands "More..." sections)
- Image URL
- Social links (Spotify, Instagram, etc.)

**Note:** New artists are added with `stage: null` and `startTime: null` until Sziget announces the schedule.

---

### `npm run lineup:clean`
**File:** `src/scripts/clean_lineup.js`

Cleans and enriches the data:

1. **URL Decoding** - Fixes names like `%2B` → `+`
2. **Day Extraction** - Moves day from genres to `day` field
3. **Deduplication** - Merges duplicate entries, keeps best data
4. **Country Codes** - Adds flags from built-in lookup table
5. **Sorting** - Alphabetical by artist name

**Adding New Country Codes:**
When new artists are added, edit the `ARTIST_COUNTRIES` object in `clean_lineup.js`:

```javascript
const ARTIST_COUNTRIES = {
    'new artist name': 'XX',  // ISO 2-letter code
    // ...
    // ...
};
```

**Overriding Incorrect Days:**
To manually fix a schedule day (e.g. if extracted incorrectly), edit `MANUAL_DAYS` in `clean_lineup.js`:

```javascript
const MANUAL_DAYS = {
    'bbno$': 'Saturday',
    // ...
};
```

---

### `npm run lineup:vibes`
**File:** `update_vibes.js` (root)

Generates "vibe" tags based on genres:
- ROCK → High Energy, Anthemic
- TECHNO → Dance, Hard
- POP → Sing-along, Feel-good

**Manual Overrides:** Edit the `manualVibes` object for specific artists.

---

### `npm run lineup:show`
**File:** `src/scripts/show_lineup.js`

Displays a formatted summary grouped by day:
```
📅 TUESDAY
   ⭐ Florence + The Machine (Main Stage)  <- Has full schedule
   🎵 Zara Larsson                         <- Day only
   
❓ DAY TBD
   • New Artist Name                       <- No day yet
```

---

## 🔧 Manual Workflow

If you prefer running steps individually:

```bash
# Step 1: Scrape new data from Sziget website
npm run lineup:scrape

# Step 2: Clean, dedupe, add countries
npm run lineup:clean

# Step 3: Generate vibes
npm run lineup:vibes

# Step 4: View summary
npm run lineup:show
```

---

## ⚠️ Troubleshooting

### New artist missing country flag?
Add them to `ARTIST_COUNTRIES` in `src/scripts/clean_lineup.js`

### Duplicate artists appearing?
Run `npm run lineup:clean` - it auto-dedupes

### Day showing in genres?
The clean script auto-extracts days. If it's still there, the day name might be in an unexpected format.

### Scraper not finding new artists?
The Sziget website uses lazy loading. The scraper scrolls automatically, but if the page structure changes, you may need to adjust the selectors in `scrape_all_artists.js`.

---

## 📊 Current Stats

- **Total Artists:** ~80
- **With Day:** ~58
- **Day TBD:** ~22
- **With Full Schedule:** 0 (mock data cleared)

Last updated: February 2026
