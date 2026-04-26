# 📋 Active Foundation Tasks (Phase 2)

This document tracks the parallel foundation-hardening efforts. Tasks are assigned to specific agents to ensure **Domain Isolation** and prevent merge conflicts.

---

## 🟥 Task A: The Gatekeeper (Config Validation)
**Assigned to:** Gemini
**Status:** ✅ Complete
**Domain:** `scripts/`, `festivals/`

**Goal:** Prevent malformed festival data from breaking the builds.
- [x] Create `festivals/festival-config.schema.json` (JSON Schema).
- [x] Add `ajv` and `ajv-formats` to the project.
- [x] Create `scripts/utils/validate-configs.mjs` validator.
- [x] Update `scripts/sync-data.mjs` to validate all configs before syncing.
- [x] Implement "Fail Fast" logic: stop the sync if any config is invalid.

---

## 🟦 Task B: The Test Fortress (Full Suite)
**Assigned to:** Claude
**Status:** 🏃 In Progress
**Domain:** `src/test/`, `android/app/src/test/`, `android/app/src/androidTest/`

**Goal:** Reach 80%+ test coverage across Web and Android.
- [ ] Implement Unit tests for `useInsider` context.
- [ ] Implement UI tests for `ArtistCard` and `TimetableView`.
- [ ] Implement Android Room DB tests.
- [ ] Implement Android ViewModel unit tests (Discover, Map).

---

## 🟨 Task C: Brutalist Component Extraction (DRY UI)
**Assigned to:** Gemini
**Status:** 🏃 In Progress
**Domain:** `src/components/ui/brutalist/`

**Goal:** Centralize the visual identity to ensure consistency across all festivals.
- [x] Create `src/components/ui/brutalist/` directory.
- [x] Implement reusable `NeonButton` with haptic support.
- [x] Implement reusable `GlassCard` with blur variants.
- [ ] Refactor existing pages (Discover, Home) to use these components.
- [ ] Create a documented UI Storyboard (internal reference).

---

## 🚦 Parallel Safety Rules
1. **Gemini** stays in `scripts/` and `festivals/`.
2. **Claude** stays in `test/` directories and adds/modifies files only to support testability.
3. **Synchronization:** Every agent must run `git pull --rebase` before pushing to integrate the other's foundational changes.

---
*Last Updated: April 2026*
