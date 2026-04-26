# GEMINI.md — Festival Insider Platform

## Project DNA
**White-label festival engine** for Web (Next.js 16) and Android (Jetpack Compose).
This is a **Config-First** platform. Never hardcode festival names, dates, colors, or coordinates.

## 🎯 Philosophy & Strategy
*   **Web: The Strategic Hub** — Built for **Planning & Discovery**. Use the Monolithic Hub (`/`) for cross-festival comparison and global artist search.
*   **Android: The Tactical Edge** — Built for **On-Site Survival**. Use the native flavors for hardware-linked features (Acoustic Scout, SOS Beacon) and 100% offline-first performance.

## Architecture & Data Flow
- **Master Config**: `festivals/<id>/config.json` defines everything for a festival.
- **Monolithic Hub**: The Web app uses dynamic routing (`src/app/[festivalId]`) to serve all festivals from one deployment.
- **Data Packages**: Source data lives in `festivals/<id>/data/`.
- **Sync System**: `scripts/sync-data.mjs` moves data/assets to `public/data/<id>` for runtime access.
- **Android**: Gradle product flavors (e.g., `sziget`, `novarock`) determine the `FESTIVAL_ID`.

## Key Files & Hot Zones
- `festivals/`: Source of truth for all branding and data.
- `src/components/layout/insider-provider.tsx`: The `InsiderProvider` context — consume via `useInsider()`. `use-festival-data.ts` no longer exists.
- `scripts/sync-data.mjs`: Orchestrates data and asset movement.
- `src/app/`: Next.js UI implementation (Root is Hub, `[festivalId]` is specific).
- `android/`: Kotlin/Compose source.

## Mandates
- **No Hardcoding**: Always use the dynamic config (Web) or `FestivalConfig` (Android).
- **Storage Isolation**: Prefix `localStorage` keys with the active festival ID to avoid cross-festival collisions.
- **Sync First**: Always edit files in `festivals/<id>/data/`, then run `npm run lineup:sync`. Never edit `public/data/` directly.

## Common Workflows
- **Run Web Hub**: `npm run dev` (Serves all festivals automatically)
- **Sync Data Pipeline**: `npm run lineup:sync`
- **Sync Android**: `npm run android:sync:sziget`

## Gemini CLI Quick Start
- **Architecture**: Start by reading `docs/architecture/ARCHITECTURE.md` and `docs/architecture/white-label/README.md`.
- **Logic Search**: Use `grep_search` to find symbols in `src/` (Web) or `android/` (Mobile).
- **Data Audit**: Check `festivals/<id>/data/lineup.json` to verify artist data integrity.
- **Config Audit**: Check `festivals/<id>/config.json` for feature flags and theme values.
