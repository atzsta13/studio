# 🚀 Project Status: Festival Insider Platform

**Last Updated:** 2026-04-04 (The Immersive AI & Hub Pass)
**Current Phase:** Phase 5: The Meta-Hub / Phase 6: Immersive AI
**Health:** 🟢 Green (Architecture Refactored to Monolith, Local LLM Active)

## 🏁 Major Milestones Reached
- **Monolithic Hub Architecture**: Migrated Web to `/[festivalId]` structure. Root `/` is now a cross-festival discovery portal.
- **Global Vibe Scout**: Implemented Genkit-powered cross-festival matchmaker (Replacing Spotify API).
- **Acoustic AI Scout**: Integrated Google AI Edge (Gemma 4) UI and infra for offline sound identity on Android.
- **Dynamic Routing & Data**: Refactored all 8+ core pages to load data dynamically based on URL params.
- **Unified Schema 2.0**: All festivals now share `radarFocuses`, `emergencyContacts`, and `passport` JSON schemas.
- **Hardware Verified**: Local Gemma 4 inference tested on Galaxy S25 (Snapdragon 8 Gen 4).

## 🚨 Feature Holds (Suspended)
- **Spotify Integration**: **ON HOLD**. Restrictive Spotify Dev policies (manual user allow-listing) make this unfeasible for a white-label public app. Pivoted to "Natural Language Scouting."

## 🛠️ Unified Hot Zones
1. **Master Config**: `festivals/<id>/config.json` (The "Brains").
2. **Data Packages**: `festivals/<id>/data/` (Lineup, POI, Guide, Food).
3. **Asset Sync**: `scripts/sync-data.mjs` (Now prepares Hub-wide data in `public/data/`).

## 🔜 Next Quality Priorities
- [ ] **SVG Map Precision**: Actual coordinate-mapped SVG layouts for Sziget and Austrian venues.
- [ ] **Acoustic Conformer**: Real microphone sampling logic for the local Gemma engine.
- [ ] **Follow Your Artist**: Hub-wide search results showing artist dates across multiple festivals.
- [ ] **Android Multi-Flavor**: Finalizing build variants for all production festivals.

## 📝 LLM / Agent Context
The platform is now **Monolithic and Agentic**. Use `useFestivalData` on Web and `LocalScoutRepository` on Android. Never assume a static festival context.
