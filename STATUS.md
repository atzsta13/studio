# 🚀 Project Status: Festival Insider Platform

**Last Updated:** 2026-03-29 (Session Wrap-up)
**Current Phase:** Phase 3: Launch Readiness (Advanced)
**Health:** 🟢 Green (Architecture streamlined, Multi-flavor builds verified)

## 🏁 Major Milestones Reached
- **Unified Config Architecture**: Moved the master brain to `config.json`. Web and Android are now 100% synchronized via a single JSON source of truth.
- **Massive Code Cleanup**: Deleted **25,000+ lines** of redundant hardcoded configuration objects across both platforms.
- **Production Data Packages**: Scraped and refined full lineups for **Nova Rock** (84 acts) and **Frequency** (47 acts), including bios and high-res images.
- **AI Taxonomic Vibe Engine**: Centralized Genre-to-Vibe mapping powers discovery for all four festivals automatically.
- **Hardware Verified**: Successfully built and deployed 4 independent branded apps to physical Android hardware via ADB.

## 🛠️ Unified Hot Zones
1. **Master Config**: `festivals/<id>/config.json` (Change one file to rebrand the entire platform).
2. **Data Packages**: `festivals/<id>/data/` (Lineup, POI, Guide).
3. **Asset Sync**: `scripts/sync-data.mjs` (Handles icons, maps, and JSON bundles).

## 🔜 Future Priorities (Phase 3 Cont.)
- [ ] **Venue Map Design**: Actual coordinate-mapped SVG layouts for Austrian venues.
- [ ] **Android Icon Branding**: Final unique festival icons in `res/mipmap` folders.
- [ ] **Data Sync Button**: Optional Android feature to pull latest JSON from the hosted web app.

## 📝 LLM / Agent Context
The platform is now **Data-Driven and Streamlined**. Never hardcode config in Kotlin or TypeScript. All branding lives in the festival-specific `config.json`.
