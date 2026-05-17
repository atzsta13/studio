# ✅ Verification & Quality Guide

This document outlines the protocols for maintaining platform integrity across both Web and Android.

## 1. Automated Testing

### **Web (Vitest / RTL)**
Every PR must pass the full test suite (190+ tests).
```bash
npm test -- --run
```
- **Coverage focus**: `InsiderProvider`, translation logic, and core UI components.

### **Android (JUnit / Turbine)**
All ViewModels must have 100% test coverage using In-Memory fakes.
```bash
cd android
./gradlew testSzigetDebugUnitTest
```
- **Fakes used**: `InMemorySharedPreferences`, `FakeUserDao`, `IWeatherRepository`.

## 2. Integrity Checks

### **Type Safety**
Strict TypeScript mode is enforced. No `any` allowed.
```bash
npm run typecheck
```

### **Config Validation**
All festival configurations are validated against a JSON Schema before sync.
```bash
npm run lineup:sync
```

### **Android Resource Compilation**
Always verify that the AAPT compiler is happy with new assets.
```bash
./gradlew assembleSzigetDebug
```

## 3. The "Main Stage" Stress Test
Before certifying a feature as "Stable," it must pass these criteria:
1. **0 Bars of Signal**: Feature functions with airplane mode enabled.
2. **High Density**: UI remains responsive during background local AI inference.
3. **No Account**: Feature is accessible without any login or personal data.
4. **Offline First**: All necessary data is either bundled or cached from a previous session.
