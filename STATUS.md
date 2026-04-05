# 🚀 Project Status: Festival Insider Platform

**Last Updated:** 2026-04-04 (The Immersive AI & Hub Pass)
**Current Phase:** Phase 5: The Meta-Hub / Phase 6: Immersive AI
**Health:** 🟢 Green (Architecture Refactored to Monolith, Local LLM Active)

## 🏁 Major Milestones Reached
- **Monolithic Hub Architecture**: Migrated Web to `/[festivalId]` structure. Root `/` is now a cross-festival discovery portal.
- **Global Vibe Scout**: Implemented Genkit-powered cross-festival matchmaker (Replacing Spotify API).
- **Acoustic AI Scout**: Integrated Google AI Edge (Gemma 4) UI and infra for offline sound identity on Android.
- **Dynamic Routing & Data**: Refactored all 8+ core pages to load data dynamically based on URL params.
- **Hardware Verified**: Local Gemma 4 inference tested on Galaxy S25 (Snapdragon 8 Gen 4).

## 🚨 Feature Holds (Suspended)
- **Spotify Integration**: **ON HOLD**. Restrictive Spotify Dev policies (manual user allow-listing) make this unfeasible for a white-label public app. Pivoted to "Natural Language Scouting."

## 🛠️ Unified Hot Zones
1. **Master Config**: `festivals/<id>/config.json` (The "Brains").
2. **Data Packages**: `festivals/<id>/data/` (Lineup, POI, Guide, Food).
3. **Asset Sync**: `scripts/sync-data.mjs` (Now prepares Hub-wide data in `public/data/`).

## 🔜 Next Quality Priorities
- [x] **Acoustic Conformer**: Real microphone sampling logic for the local Gemma engine. (✅ VERIFIED)
- [x] **Follow Your Artist**: Hub-wide search results showing artist dates across multiple festivals. (✅ POLISHED)
- [ ] **Android Multi-Flavor**: Finalizing build variants for all production festivals.
- [!] **SVG Map Precision**: **ON HOLD**. Accurate coordinate-mapped SVG layouts are not available from organizers. Fallback generic map implemented.

## 📝 LLM / Agent Context
The platform is now **Monolithic, Agentic, and Highly Organized**. Use `useFestivalData` on Web and `LocalScoutRepository` on Android. Documentation is hierarchical under `docs/`.
