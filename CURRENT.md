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
    *   *State:* Uses a global context (`InsiderProvider`) to inject festival configs, lineup data, and user favorites. 
*   **Android (The Tactical Edge):** Jetpack Compose, Kotlin 2.0.21, MVVM, Room DB.
    *   *Path:* `android/app/src/main/`
    *   *State:* Multi-flavor architecture. Each festival is a distinct build variant. Uses a `BaseJsonRepository` to load offline data from `assets/`.
*   **Data Pipeline:** `scripts/`
    *   *State:* Node scripts parse, clean, and sync JSON data from `festivals/<id>/data/` into the respective Web and Android directories.

## 2. ✅ What Was Just Completed (Verification Required)

The previous agent completed a massive **Phase 2 DRY (Don't Repeat Yourself) Refactor**:
1.  **Web Hooks Unified:** Eradicated `useFestivalData` and `useFavorites`. Replaced with a unified `useInsider` context provider.
2.  **Android Repositories Abstracted:** Replaced redundant JSON parsing in Food, POI, and Guide repositories with a single `BaseJsonRepository<T>`.
3.  **Script Environments:** Centralized festival pathing logic into `scripts/utils/festival-env.mjs`.

## 3. 🔬 How to Verify My Work

If you are a verifying LLM, execute the following commands to prove the integrity of the codebase:

**Verify Web Compilation:**
```bash
npm run typecheck
npm run build
```
*Expected Result:* Zero TypeScript errors. Successful Next.js build.

**Verify Android Multi-Flavor Compilation:**
```bash
cd android
./gradlew assembleDebug
```
*Expected Result:* `BUILD SUCCESSFUL`. All 5 flavors (sziget, novarock, frequency, area53, erntepunk) compile without unresolved references.

**Verify Data Integrity:**
```bash
npm run lineup:sync
```
*Expected Result:* Scripts execute successfully using the new `festival-env.mjs` utility, copying configs and JSONs to `public/data/` and `src/data/`.

## 4. 🚀 What's Next (Open Work)

- **Strict Type Enforcement:** Hunt down and eliminate any remaining `any` types in `src/ai/flows/` or dynamic React components.
- **Auto-Config Validation:** Implement a JSON schema validator for `config.json` inside the sync scripts to prevent malformed data from breaking the builds.
- **Brutalist UI Kit:** Extract shared UI components (Neon buttons, glass cards) into a dedicated, documented `src/components/ui/brutalist/` directory.

---
*End of context. Proceed with your directives.*