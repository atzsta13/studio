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

1.  **Update Data**: `NEXT_PUBLIC_FESTIVAL_ID=sziget-2026 npm run lineup:scrape`
2.  **Clean & Merge**: `NEXT_PUBLIC_FESTIVAL_ID=sziget-2026 npm run lineup:clean`
3.  **Enrich Vibes**: `NEXT_PUBLIC_FESTIVAL_ID=sziget-2026 npm run lineup:vibes`
4.  **Sync Local**: `npm run lineup:sync`
5.  **Sync Mobile**: `npm run android:sync:sziget`
6.  **Validate Web**: `npm run typecheck`
7.  **Validate Android**: `cd android && ./gradlew assembleSzigetDebug`

---

## 🔬 Advanced Verification (Chrome DevTools MCP)

For high-fidelity verification of the white-label UI and performance, we utilize the `chrome-devtools-mcp` integration.

### Automated UI Audits
Use the MCP tools to verify that theme configurations (colors, fonts, brutalist aesthetics) render correctly across all dynamic routes.
- **Tools:** `navigate_page`, `take_screenshot`, `get_dom_snapshot`
- **Reference:** `docs/integration/CHROME_DEVTOOLS_MCP.md`

### Performance Survival Checks
Ensure the app meets "On-Site Survival" standards under emulated network conditions.
- **Tools:** `emulate_network_conditions`, `record_performance_trace`

---

## 🛡️ Mandate Checklist
Before pushing to `main`, ensure your changes adhere to `docs/guides/MANDATES.md`:
- [ ] No Camera/Vision features added.
- [ ] No personal financial trackers implemented.
- [ ] UI is 100% config-driven (No hardcoded strings).
- [ ] Feature is wrapped in a `FESTIVAL.features` or `FestivalConfig.FEATURES` toggle.
