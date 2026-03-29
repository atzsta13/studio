# CLAUDE.md — Festival Insider Platform

This file provides guidance to Claude Code and other LLM agents when working with this white-label festival engine.

## Project Overview

The **Festival Insider Platform** is a multi-festival engine with two parallel codebases:
- **Web** (Next.js 16 / React 19) — root directory.
- **Android** (Jetpack Compose / Kotlin) — `android/` directory.

### **White-Label Mandate (CRITICAL)**
This is a **Config-First** platform. **NEVER** hardcode brand names (Sziget, Nova Rock), dates, colors, or coordinates in components or logic.
- **Web**: Always import `FESTIVAL` from `@/config/festival`.
- **Android**: Always use `FestivalConfig` constants.
- **Data**: All festival-specific data lives in `festivals/<festival-id>/data/`. The build process (`npm run prebuild`) syncs this to `src/data/`.

## Common Commands

### Web (Next.js)
```bash
# Development (defaults to Sziget)
npm run dev 

# Build/Dev for specific festival
NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run dev
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run build

# Quality Control
npm run typecheck    # Must pass before any merge
npm run lint
```

### Android
```bash
# Build specific flavor
./gradlew assembleSzigetDebug
./gradlew assembleArea53Debug
./gradlew assembleNovarockDebug
./gradlew assembleFrequencyDebug
```

## Architecture Patterns

### 1. Web Configuration
- **Interface**: `FestivalConfig` in `src/config/festival.ts`.
- **Injection**: `FESTIVAL` object is exported based on `process.env.NEXT_PUBLIC_FESTIVAL_ID`.
- **Theming**: `src/app/layout.tsx` injects CSS variables (`--primary`, `--accent`, etc.) from the config.

### 2. Android Configuration
- **Product Flavors**: Defined in `android/app/build.gradle.kts`.
- **Flavor Config**: `FestivalConfig.kt` switches logic based on `BuildConfig.FESTIVAL_ID`.
- **Themes**: `FestivalInsiderTheme` in `Theme.kt` pulls colors dynamically.

### 3. Data Flow
- **Source**: `festivals/<id>/data/*.json`.
- **Sync**: `scripts/sync-data.mjs` (Web) and `scripts/sync-android-assets.mjs` (Android).
- **Format**: All data is static JSON. No live DB connection for lineup info.

### 4. Storage & Persistence
- **Web**: `localStorage` keys **must** be prefixed with `${FESTIVAL.id}` to avoid cross-festival data pollution.
- **Android**: Room database name and SharedPreferences are dynamically named per festival.

## Coding Standards
- **TypeScript**: Strict mode. No `any`. Use interfaces from `src/types/index.ts`.
- **Offline-First**: All features (except Spotify matching) must work without an internet connection.
- **Brutalist UI**: Follow the high-contrast, bold aesthetic defined in `docs/UI_GUIDE.md`.
- **Haptics**: Required on all interactive elements in Android via `rememberHapticManager()`.
