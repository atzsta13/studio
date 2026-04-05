# 🔄 Data Sync & Pipeline Protocol

## 🌌 The Lifecycle of Data
To maintain integrity across Web and Android, data follows a strict "One-Way Flow."

### 1. Extraction (Scraping)
- **Tool**: `src/scripts/scrape_all_artists.js`.
- **Action**: Crawls the official festival website.
- **Output**: Writes a "dirty" JSON to `festivals/[id]/data/lineup.json`.

### 2. Normalization (Cleanup)
- **Tool**: `src/scripts/clean_lineup.js`.
- **Action**: 
    - Decodes URL strings.
    - Extracts performance days from genre tags.
    - **Logic-Based Stage Assignment**: Infers the stage based on the bio keywords (e.g., "Colosseum") or headliner status.
    - Marked headliners for the "Main Stage Heroes" radar.

### 3. Enrichment (AI Backfill)
- **Tool**: `scripts/backfill-vibes.mjs`.
- **Action**: Uses the **Taxonomic Vibe Engine** to map raw genres to app-vibe tags (e.g., `Techno` -> `Hypnotic`). This ensures the Vibe Quiz and AI Scout have high-quality metadata.

### 4. Propagation (Asset Sync)
- **Web**: `scripts/sync-data.mjs` copies all JSON files from `festivals/` to `public/data/`. This allows the Monolithic Hub to fetch data for any festival dynamically via HTTP.
- **Android**: `scripts/sync-android-assets.mjs` copies the JSON files into the specific Android flavor's `assets/` folder.

---

## 🛠️ Operational Commands

### Sync everything for Web (Hub mode)
```bash
npm run lineup:sync
```

### Update a specific festival's data
```bash
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run lineup:update
```

### Propagation to Android
```bash
npm run android:sync:[sziget|area53|novarock|frequency]
```

---

## ⚠️ Integrity Rules
1.  **NEVER** edit `src/data/` or `public/data/` directly. Your changes will be overwritten.
2.  **ALWAYS** edit the source in `festivals/[id]/data/`.
3.  **VALIDATE** before commit: Run `npm run typecheck` to ensure the JSON structure hasn't drifted from the TypeScript interfaces.
