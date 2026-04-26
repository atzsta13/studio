# 🏗️ Phase 2: Foundation, DRY & Scalability

With the platform stable and feature-rich, Phase 2 focuses on **Hardening the Core**. We will condense code, remove redundancies, and ensure the foundation can scale to 100+ festivals without friction.

## 🎯 Primary Goals

### 1. 📂 Code Condensation (DRY)
- **Shared Script Utils**: Consolidate "festival finding" and "path resolution" logic in `scripts/`.
- **Base ViewModels (Android)**: Create common patterns for loading JSON assets to reduce boilerplate.
- **Unified Hooks (Web)**: Merge `useFestivalData` and `useFavorites` into a single, high-performance `useInsider` context.

### 2. 💎 Type Safety & Developer Experience
- **Total Strict Mode**: Eliminate remaining `any` types in AI flows and dynamic components.
- **Auto-Config Validation**: Add a JSON schema check to ensure `config.json` is valid before syncing.

### 3. 🚀 Component Atomicity
- **Brutalist UI Kit**: Extract shared "Brutalist" components (Neon Buttons, Header Shells, Glass Cards) into a standalone directory to ensure visual consistency.
- **Cross-Platform Parity**: Ensure every Web feature has a documented "Tactical Mirror" on Android.

---

## 🛠️ Implementation Backlog (Foundation)

### 🔴 High Priority: Script Refactor
Currently, `sync-data.mjs` and `sync-android-assets.mjs` repeat pathing logic.
- **Action**: Create `scripts/lib/festival-env.mjs` as a shared utility.

### 🟡 Medium Priority: Web Layout DRYing
Pages like `discover`, `map`, and `tools` all repeat header/container logic.
- **Action**: Create a `FestivalLayout` wrapper that injects the config and common navigation.

### 🟢 Low Priority: Android Base Repository
- **Action**: Create `BaseJsonRepository<T>` to handle standard asset loading and decoding.

---
*Created: April 2026*
