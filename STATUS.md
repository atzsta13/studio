# 🚀 Project Status: Festival Insider Platform

**Last Updated:** 2026-03-29
**Current Phase:** Phase 3: Launch Readiness (In Progress)
**Health:** 🟢 Green (All 4 Android flavors and Web builds verified)

## 🏁 Recent Milestones
- **Multi-Tenant Data Pipeline**: Completed Phase 2. The platform now ingests, cleans, and "vibes" lineups for multiple festivals automatically.
- **Lineup Depth**: Scraped and processed 84 artists for Nova Rock and 47 for Frequency, including full bios and images.
- **Taxonomic Vibe Engine**: Centralized Genre-to-Vibe mapping system implemented to power AI Discovery across different musical styles.
- **Android Multi-Flavor**: Successfully deployed 4 independent apps (Sziget, Area 53, Nova Rock, Frequency) to physical hardware via ADB.
- **Data-Driven Navigation**: Refactored the Tactical Map to be entirely driven by per-festival `poi.json` files.

## 🛠️ Active "Hot Zones" (Where the brains are)
1. **Scraper Config**: `src/scripts/scrape_all_artists.js` (Selector matrix for all festivals).
2. **Vibe Logic**: `scripts/vibe-taxonomy.mjs` (The source of truth for AI vibes).
3. **Asset Sync**: `scripts/sync-data.mjs` (Handles icons, maps, and JSON bundles).
4. **Android Config**: `build.gradle.kts` (Product flavor and app name management).

## 🔜 Next Priorities
- [ ] **SVG Map Design**: Replace "Coming Soon" placeholders with actual coordinate-mapped SVG venue layouts.
- [ ] **Android Icon Branding**: Replace placeholder Sziget icons with unique festival branding in `res/mipmap` folders.
- [ ] **Scraper Polish**: Automate the Genre-Inference step using the AI script for future waves of announcements.

## 📝 LLM / Agent Context
This is a **Production-Grade White-Label Platform**. All core extraction is done. When adding features, ensure they respect the `FESTIVAL` config (Web) and `FestivalConfig` (Android).
