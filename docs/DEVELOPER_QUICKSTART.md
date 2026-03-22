# ⚡ Developer Quickstart

Welcome! This project consists of a Next.js web application and a native Android app. They share the same lineup data.

## 🛠️ Environment Setup

### 1. Web
```bash
npm install
npm run build  # Verify build
```

### 2. Android
Ensure you have the Android SDK installed.
```bash
cd android
./gradlew assembleDebug  # Verify build
```

## 🔄 Data Flow (The Grand Sync)

If you update the lineup scraper or AI logic, you must sync the results to the mobile app:

```bash
# From the project root:
chmod +x sync.sh
./sync.sh
```

This script:
1. Scrapes latest data (optional).
2. Updates vibes/genres via AI.
3. Copies `src/data/*.json` to `android/app/src/main/assets/`.

## 🧪 Testing

- **Web**: `npm run lint`
- **Android**: `./gradlew test` (Unit tests for Clash Logic & ViewModels)

## 🗺️ Navigation
Check `docs/PROJECT_MAP.md` to see where the core logic resides.
