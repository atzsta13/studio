# 🗺️ Project Map


## 📱 Android (Native Jetpack Compose)
- **`android/app/src/main/java/.../data/config/FestivalConfig.kt`**: The "brain" of the Android white-labeling. Switches themes and features based on `FESTIVAL_ID`.
- **`android/app/src/main/java/.../ui/schedule/ScheduleViewModel.kt`**: Handles sorting, filtering, and clash detection.
- **`android/app/src/main/java/.../ui/components/DesignSystem.kt`**: Brutalist UI tokens and theme definitions.

## 🌐 Web (Next.js 16)
- **`src/config/festival.ts`**: The central configuration loader for the Web app.
- **`src/ai/flows/recommend-artists-flow.ts`**: Genkit-based AI logic for artist discovery.
- **`src/lib/spotify.ts`**: Spotify Web API integration and playlist builder.
- **`src/app/discover/page.tsx`**: The main discovery interface with AI and Spotify integration.

## 📊 Data Layer (White-Label)
- **`festivals/<id>/config.json`**: **Master Source of Truth** for branding and features per festival.
- **`festivals/<id>/data/lineup.json`**: Artist data for the specific festival.
- **`src/data/`**: The active data package synced from `festivals/` at build time.

## 🛠️ Scripts
- **`scripts/sync-data.mjs`**: Orchestrates data movement from `festivals/` to `src/data/`.
- **`src/scripts/scrape_all_artists.js`**: Multi-festival scraper for official lineups.
- **`scripts/backfill-vibes.mjs`**: Enrichment script that adds vibe tags based on genres.
