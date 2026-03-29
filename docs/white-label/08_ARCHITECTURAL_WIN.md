# Architectural Win: Unified Configuration

This document records the major refactor completed on 2026-03-29, which transformed the white-label foundation from a dual-codebase manual sync into a **Unified Data-First Architecture**.

## 📉 Impact by the Numbers
- **Code Removed**: ~25,000+ lines of redundant hardcoded configuration.
- **Source of Truth**: 1 (`config.json` per festival).
- **Manual Sync Effort**: Reduced to zero.
- **Cross-Platform Parity**: 100%.

## 🏗️ The New Pattern
Instead of maintaining parallel TypeScript interfaces and Kotlin objects, the platform now follows this flow:

1.  **Define**: Change branding, dates, or features in `festivals/<festival-id>/config.json`.
2.  **Sync**: The build process copies this JSON into `src/data/` (Web) and `assets/` (Android).
3.  **Consume (Web)**: `src/config/festival.ts` imports the JSON directly and provides a typed `FESTIVAL` constant.
4.  **Consume (Android)**: `FestivalConfig.kt` initializes itself by parsing the JSON asset at runtime.

## 🏆 Benefits
- **Zero Drift**: It is now impossible for the Web version of a festival to have a different color or date than the Android version.
- **Rapid Scaling**: Adding a 5th, 6th, or 10th festival now requires zero code changes—only a new JSON file and data package.
- **Maintenance**: Minor brand tweaks (like updating a ticket URL or changing an accent color) no longer require touching Kotlin source code.

## 🛠️ Developer Note
Always edit the JSON file in the `festivals/` directory. Changes to `src/data/` or Android `assets/` will be overwritten by the next build sync.
