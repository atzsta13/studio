# 🧠 CURRENT.md (State of the Union)

**Target Audience:** Autonomous AI Agents / LLMs joining the workspace.
**Purpose:** A real-time, comprehensive snapshot of the repository's exact state, architecture, and verification protocols. Read this to instantly synchronize with the current context before making changes.

**Last Updated:** May 2026
**Current Phase:** Phase 3 COMPLETE. Codebase is fully green.

---

## 1. 🏗️ Architectural Snapshot

This is a **White-Label Monolithic Engine** powering multiple festival apps (Sziget, Nova Rock, Frequency, Area 53) from a single codebase.

*   **Web (The Hub):** Next.js 16, React 19 App Router. 
    *   *State:* Uses a unified `InsiderProvider` context. All tactical pages are wrapped in `FestivalLayoutShell`.
    *   **UI Kit:** Standardized Brutalist components in `src/components/ui/brutalist/` (NeonButton, GlassCard).
*   **Android (The Tactical Edge):** Jetpack Compose, Kotlin 2.0.21, MVVM, Room DB (v8).
    *   *Data:* Uses `BaseJsonRepository` for all asset loading.
*   **Data Pipeline:** Node scripts in `scripts/` using `festival-env.mjs`.

## 2. ✅ Verified Foundation (All Passed)

The platform has reached a high-integrity state through multi-phase parallel agent execution:

1.  **Phase 2 — Test Suite:** 198 passing tests covering hooks, components, and pipeline logic. (See `docs/TESTING.md`).
2.  **Phase 2 — UI Foundation:** Web refactored to use atomic `NeonButton` and `GlassCard` components.
3.  **Phase 2 — Config Security:** Automated JSON Schema validation (Ajv) protects all festival configs during sync.
4.  **Phase 3 — Feature Expansion:** Vibe DNA Quiz, Serendipity Mode, Country Explorer, Survival Guide, Lineup Diff, Map coordinate fix + hydration pulse, Vibe backfill (100% coverage).
5.  **Phase 3 — TypeScript:** 0 errors. `GenreOption` union includes JAZZ/AMBIENT.
6.  **Phase 3 — White-label compliance:** All hardcoded hex colors purged from quiz/discover/timetable/tools components — now use CSS vars and `FESTIVAL.theme.*`.

## 3. 🔬 How to Verify Work

**Run the Web Test Suite:**
```bash
npm run test
```

**Verify Web Build:**
```bash
npm run typecheck && npm run build
```

**Verify Android Multi-Flavor Build:**
```bash
cd android && ./gradlew assembleDebug
```

## 4. 🚀 Future Roadmap (Phase 4+)

- **Dynamic Schedule Data:** Integrate real Sziget 2026 set times once the API/JSON is published.
- **Multimodal AI:** Port the "Natural Language Scout" to a local Gemma 4 engine on Android for 100% offline reasoning (see `docs/phases/PHASE_6_IMMERSIVE_AI.md`).
- **Cross-Festival Hub:** Enhance the root `/` portal for global artist touring patterns (see `docs/phases/PHASE_5_META_HUB.md`).

---
*Status: GREEN. Foundation Hardened.*
