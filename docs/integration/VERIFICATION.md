# Verification & Quality Guide

> Last updated: 2026-06-12. Single-APK architecture — no product flavors.

## Automated Testing

### Web (Vitest / RTL)
```bash
npm test -- --run          # 189 tests, must stay green
npm run typecheck          # 0 errors (chart.tsx has 4 pre-existing ShadCN errors — known, skip)
npm run lint               # ESLint clean
```

### Android (JUnit / Turbine)
```bash
cd android
./gradlew test             # unit tests — no device required
```

Fakes used in tests: `InMemorySharedPreferences`, `FakeUserDao`, `IWeatherRepository`.

## Build & Install

### Web (static export)
```bash
npm run build              # outputs to out/ — deploy by pushing to main
```
GitHub Actions auto-deploys to https://atzsta13.github.io/studio/ on every push to `main`.

### Android (single APK)
```bash
cd android
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk

# Install to connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk
# or
adb install -r -t app/build/outputs/apk/debug/app-debug.apk
```

There is **one APK** — no flavor suffix. `applicationId` is `com.example.festivalinsider`.

## Integrity Checks

### Config validation
All festival configs are validated during sync:
```bash
npm run lineup:sync        # validates and syncs all festivals
```

### Android resource compilation
```bash
cd android
./gradlew compileDebugKotlin   # fast check — Kotlin only, no full APK build
```

## The Main Stage Stress Test

Before marking a feature stable:

1. **0 Bars of Signal** — airplane mode on, feature still works
2. **No Account** — accessible without any login or personal data
3. **Offline First** — all data bundled or cached from previous session
4. **Direct Sunlight** — readability at max brightness, OLED black background
