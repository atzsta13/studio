# GEMINI.md — Festival Insider Platform

## Project DNA
**White-label festival engine** for Web (Next.js 16) and Android (Jetpack Compose).
This is a **Config-First** platform. Never hardcode festival names, dates, colors, or coordinates.

## Architecture & Data Flow
- **Master Config**: `festivals/<id>/config.json` defines everything for a festival.
- **Web Loader**: `src/config/festival.ts` exports the `FESTIVAL` constant based on `NEXT_PUBLIC_FESTIVAL_ID`.
- **Data Packages**: Source data lives in `festivals/<id>/data/`.
- **Sync System**: `scripts/sync-data.mjs` moves data/assets to `src/data/` and `public/` at build/dev time.
- **Android**: Gradle product flavors (e.g., `sziget`, `novarock`) determine the `FESTIVAL_ID`.

## Key Files & Hot Zones
- `festivals/`: Source of truth for all branding and data.
- `src/config/festival.ts`: The bridge between JSON config and the Web app.
- `scripts/sync-data.mjs`: Orchestrates data and asset movement.
- `src/app/`: Next.js UI implementation.
- `android/`: Kotlin/Compose source.

## Mandates
- **No Hardcoding**: Always use `FESTIVAL` (Web) or `FestivalConfig` (Android).
- **Storage Isolation**: Prefix `localStorage` keys with `${FESTIVAL.id}` to avoid cross-festival collisions.
- **Sync First**: Always edit files in `festivals/<id>/data/`, then run `npm run lineup:sync`. Never edit `src/data/` directly.

## Common Workflows
- **Switch Festival**: `NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run dev`
- **Update Lineup**: `NEXT_PUBLIC_FESTIVAL_ID=sziget-2026 npm run lineup:update`
- **Sync Android**: `npm run android:sync:sziget`

## Gemini CLI Quick Start
- **Architecture**: Start by reading `docs/ARCHITECTURE.md` and `docs/white-label/README.md`.
- **Logic Search**: Use `grep_search` to find symbols in `src/` (Web) or `android/` (Mobile).
- **Data Audit**: Check `festivals/<id>/data/lineup.json` to verify artist data integrity.
- **Config Audit**: Check `festivals/<id>/config.json` for feature flags and theme values.
