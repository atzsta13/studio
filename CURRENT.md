# 🧠 CURRENT.md (State of the Union)

**Target Audience:** Autonomous AI Agents / LLMs joining the workspace.
**Purpose:** A real-time, comprehensive snapshot of the repository's exact state, architecture, and verification protocols. Read this to instantly synchronize with the current context before making changes.

**Last Updated:** April 2026
**Current Phase:** Phase 2 Foundation (Hardening & DRYing)

---

## 1. 🏗️ Architectural Snapshot

This is a **White-Label Monolithic Engine** powering multiple festival apps (Sziget, Nova Rock, Frequency, Area 53) from a single codebase.

*   **Web (The Hub):** Next.js 16, React 19 App Router. 
    *   *Path:* `src/app/[festivalId]/`
    *   *State:* Uses a global context (`InsiderProvider` in `src/components/layout/insider-provider.tsx`) to provide festival configs, lineup data, and user favorites. 
    *   **CRITICAL:** The hooks `useFestivalData` and `useFavorites` have been DELETED. Use `useInsider()` instead.
*   **Android (The Tactical Edge):** Jetpack Compose, Kotlin 2.0.21, MVVM, Room DB.
    *   *Path:* `android/app/src/main/`
    *   *State:* Multi-flavor architecture. Each festival is a distinct build variant. Uses a `BaseJsonRepository` to load offline data from `assets/`.
*   **Data Pipeline:** `scripts/`
    *   *State:* Node scripts parse, clean, and sync JSON data from `festivals/<id>/data/` into the respective Web and Android directories. Centralized pathing logic exists in `scripts/utils/festival-env.mjs`.

## 2. ✅ Implemented Features (Verified)

Do NOT re-implement these. They are already in the codebase:

*   **Vibe DNA Quiz:**
    *   *Web:* `src/app/[festivalId]/vibe-quiz/page.tsx`
    *   *Android:* `android/app/src/main/java/com/example/szigerinsider2026/ui/quiz/`
*   **Lineup Diff (2025 vs 2026):**
    *   *Web:* `src/components/home/lineup-diff.tsx`
*   **Survival Guide:**
    *   *Web:* `src/components/tools/survival-guide.tsx`
    *   *Android:* `android/app/src/main/java/com/example/szigerinsider2026/ui/tools/SurvivalGuideScreen.kt`
*   **Country Explorer:**
    *   *Web:* `src/components/discover/country-explorer.tsx`
*   **Serendipity Mode (Surprise Me):**
    *   *Web:* `src/components/discover/SerendipityModal.tsx`
*   **Global Vibe Scout (Genkit):**
    *   *Web:* `src/ai/flows/global-match-flow.ts` (Accessible from the Hub `/`)

## 3. 🔬 How to Verify Work

Execute the following commands to prove the integrity of the codebase:

**Verify Web Compilation:**
```bash
npm run typecheck
npm run build
```
*Expected Result:* Zero TypeScript errors in `src/`. Successful Next.js build.

**Verify Android Multi-Flavor Compilation:**
```bash
cd android
./gradlew assembleDebug
```
*Expected Result:* `BUILD SUCCESSFUL`. All 5 flavors (sziget, novarock, frequency, area53, erntepunk) compile.

**Verify Data Integrity:**
```bash
npm run lineup:sync
```
*Expected Result:* Scripts execute successfully using `festival-env.mjs`.

## 4. 🚀 Open Work / Potential Improvements

- **Strict Type Enforcement:** Hunt down and eliminate any remaining `any` types in `src/ai/flows/` or dynamic React components.
- **Auto-Config Validation:** Implement a JSON schema validator for `config.json` inside the sync scripts.
- **Brutalist UI Kit:** Extract shared UI components (Neon buttons, glass cards) into a dedicated `src/components/ui/brutalist/` directory.
- **Android "My Lineup" Export:** Shareable image generation for personal schedules (as proposed in Phase 3).

---
*End of context. Proceed with your directives.*