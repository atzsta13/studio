# ⚡ Developer Quickstart: The White-Label Engine

Welcome to the **Festival Insider Platform**, a unified white-label ecosystem powering both Next.js (Web) and Jetpack Compose (Android) applications from a single source of truth.

## 🏗️ Architecture: Config-First

This platform is driven entirely by JSON configuration. **Never hardcode festival names, colors, features, or coordinates into the Kotlin or TypeScript codebases.**

- **Master Config**: `festivals/<festival-id>/config.json` defines everything (theme, location, 50+ feature flags, and custom content).
- **Source Data**: `festivals/<festival-id>/data/*.json` holds the lineup, survival guide, food vendors, and POIs.
- **Web Bridge**: `src/config/festival.ts` loads the active configuration based on the `NEXT_PUBLIC_FESTIVAL_ID` environment variable.
- **Android Bridge**: `FestivalConfig.kt` loads the configuration dynamically from the bundled `assets/config.json` for the specific product flavor.

## 🛠️ Environment Setup & Workflows

### 1. Web Development (Next.js)

To run the web app, simply pass the target festival ID as an environment variable:

```bash
npm install

# Run Sziget (Default)
npm run dev

# Run Nova Rock
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run dev

# Run the Neon Oasis test festival
NEXT_PUBLIC_FESTIVAL_ID=neon-oasis-2026 npm run dev
```

*Note: The `predev` and `prebuild` scripts will automatically copy the correct festival data to the `public/` and `src/data/` directories.*

### 2. Android Development (Jetpack Compose)

Android relies on Gradle **Product Flavors** to build different apps from the same codebase. 

Before building, you must sync the target festival's data into the corresponding Android source set:

```bash
# Sync data for the Sziget flavor
npm run android:sync:sziget

# Build or run via Android Studio using the 'szigetDebug' variant
cd android
./gradlew assembleSzigetDebug
```

## 🔄 Data Updates & Syncing

When lineup data or survival guides change, you must edit the files in `festivals/<id>/data/`, **not** in `src/data/`.

**To update and sync Sziget's data:**
```bash
npm run lineup:update:sziget
npm run android:sync:sziget
```

## 🧪 Validating Changes

If you add a new feature or modify an existing one, ensure it is wrapped in a feature flag check:

- **Web**: Check `FESTIVAL.features.yourNewFeature` before rendering a component or navigation item.
- **Android**: Check `FestivalConfig.FEATURES.yourNewFeature` in Compose screens.

Before committing, ensure the configuration types are synchronized:
```bash
npm run typecheck
```
