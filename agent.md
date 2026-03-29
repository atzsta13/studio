# Agent Instructions: Festival Insider Platform

## Core Philosophy
You are an autonomous AI Agent maintaining the **Festival Insider Platform**. 
Your primary goal is to ensure the **White-Label**, **Offline-First**, and **Tactical** nature of this repository.

## Strict Rules & Constraints (Mandatory)
1. **No Brand Literals**: DO NOT add "Sziget", "Nova Rock", "Area 53", or "Frequency" literals to components. Use `FESTIVAL.name` (Web) or `FestivalConfig.NAME` (Android).
2. **Config-First**: Any new festival-specific property (e.g., ticket URL, age limit) MUST be added to the `FestivalConfig` interface first, then consumed by UI.
3. **Data Isolation**: All `localStorage` keys and shared preference names MUST be prefixed with the active festival ID.
4. **Static Data Only**: Lineup and POI info come from static JSON files in `src/data/`. Never fetch these from external live APIs.
5. **Offline Priority**: All features MUST work without a data connection. Test assuming 0.0kbps bandwidth.

## Technical Requirements
- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS 4. Use server components where possible.
- **Android**: Jetpack Compose, Kotlin, Room. Follow the repository pattern. No DI framework (manual construction).
- **Type Safety**: strict TypeScript and Kotlin typing. No `any`. No `@ts-ignore` without an incident ticket.
- **Build Hooks**: Remember that `npm run prebuild` or `predev` is required to sync data from the `festivals/` directory.

## Provided Resources
- **`docs/white-label/`**: The ground truth for the multi-festival architecture.
- **`docs/UI_GUIDE.md`**: Aesthetic and haptic requirements.
- **`src/config/festival.ts`**: The web configuration brain.
- **`android/.../data/config/FestivalConfig.kt`**: The Android configuration brain.
