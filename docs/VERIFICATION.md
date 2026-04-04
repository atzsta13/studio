# ✅ Quality Assurance & Verification Guide

This guide defines the commands and workflows required to verify the health of the white-label engine across Web and Android.

---

## 🌐 Web Hub Verification (Next.js)

Run these commands from the root directory to ensure the Monolithic Hub is stable.

### 1. Type Integrity Check
Ensures all festival `config.json` files and component props match the master TypeScript interfaces.
```bash
npm run typecheck
```

### 2. Linting & Code Quality
Checks for code smells, security risks, and unused imports.
```bash
npm run lint
```

### 3. Production Compilation
Verifies that the entire hub (including all dynamic `[festivalId]` routes) can be pre-rendered for Vercel deployment.
```bash
npm run build
```

---

## 📱 Android Verification (Jetpack Compose)

Run these commands to ensure the Survival Utility remains hardened and offline-ready.

### 1. Logic & Repository Tests
Runs all unit tests for ViewModels, Repositories (Acoustic, Lineup), and Room Database logic.
```bash
cd android
./gradlew test
```

### 2. Static Analysis (Linting)
Checks for performance bottlenecks, accessibility issues, and Compose-specific best practices for a specific flavor.
```bash
cd android
./gradlew lintSzigetDebug
```

### 3. Multi-Flavor Smoke Test
Compiles the APKs for **all** production festivals. This is the ultimate test for flavor-set and asset integrity.
```bash
cd android
./gradlew assembleDebug
```

---

## 🔄 Data Pipeline Verification

Use this sequence whenever you update a festival's source data (`festivals/<id>/data/`).

1.  **Enrich Data**: `NEXT_PUBLIC_FESTIVAL_ID=sziget-2026 npm run lineup:update`
2.  **Sync Mobile**: `npm run android:sync:sziget`
3.  **Validate Web**: `npm run typecheck`
4.  **Validate Android**: `cd android && ./gradlew assembleSzigetDebug`

---

## 🛡️ Mandate Checklist
Before pushing to `main`, ensure your changes adhere to `docs/MANDATES.md`:
- [ ] No Camera/Vision features added.
- [ ] No personal financial trackers implemented.
- [ ] UI is 100% config-driven (No hardcoded strings).
- [ ] Feature is wrapped in a `FESTIVAL.features` or `FestivalConfig.FEATURES` toggle.
