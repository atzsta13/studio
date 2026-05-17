# 🎪 Festival Insider Platform

A high-performance, **Main-Stage Certified** white-label engine for elite festival companion apps. Built to survive 100,000+ people, direct sunlight, and **0 bars of signal**.

---

## ⚡ Core Pillars
- **100% OFFLINE FIRST**: Every tactical feature (Map, Timetable, Guide, Local AI) works without internet.
- **NO ACCOUNTS**: Zero logins, zero tracking. 100% anonymous utility for the privacy-conscious attendee.
- **NO SOCIAL**: Strictly P2P local group sync via **Squad Link**. No feeds, no moderation liability.
- **NO CLOUD AI**: All intelligence is **local inference** (Gemma 4 Small). Zero data leaves the device.
- **CONFIG DRIVEN**: One engine, 5+ festivals. Branding and data are decoupled from the UI layers.

---

## 🗺️ Supported Festivals (Production Ready)

| Festival | ID | Vibe Coverage | Status |
| :--- | :--- | :--- | :--- |
| **Sziget** | `sziget-2026` | 100% | ✅ Certified |
| **Nova Rock** | `novarock-2026` | 100% | ✅ Certified |
| **Frequency** | `frequency-2026` | 100% | ✅ Certified |
| **Area 53** | `area53-2026` | 100% | ✅ Certified |
| **Ernte Punk** | `ernte-punk-2026` | 100% | ✅ Certified |

---

## 🚀 Technical Architecture

The ecosystem consists of two parallel, specialized platforms synchronized by a unified data pipeline.

### **1. Web (The Strategic Hub)**
A monolithic Next.js portal serving all festivals dynamically via `/[festivalId]`. Built for pre-festival planning and cross-festival artist discovery.
- **Tech**: Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Execution**: 
  ```bash
  npm install
  npm run dev # Global Hub: http://localhost:9002
  ```

### **2. Android (The Tactical Edge)**
A native Jetpack Compose app using Product Flavors for specialized on-site survival APKs.
- **Tech**: Kotlin 2.0, Room (v8), MediaPipe (Local LLM), Manual DI.
- **Execution**:
  ```bash
  cd android
  ./gradlew assembleSzigetDebug # Build Sziget APK
  ./gradlew test               # Run 60/60 unit tests
  ```

---

## 🛠️ Tactical Capabilities

### **Intelligence (Local-Only)**
- **Acoustic Scout**: Identifies the set you're hearing via microphone using **local Gemma 4 inference**.
- **Vibe DNA Quiz**: A gamified, offline artist discovery engine (No Spotify login required).
- **Vibe Radar**: Visual spider-chart analysis of your festival preferences.

### **Survival Toolkit**
- **Main Stage Map**: Fully cached POI dot-map for Water, First Aid, and Stages.
- **Squad Link**: Anonymous group syncing via local QR code swap (P2P).
- **Food Radar**: Pre-sorted by price and dietary needs (Vegan/Halal/etc).
- **Toolbox**: HUF/EUR converter, Weather Cache, Tent Finder (GPS), SOS Beacon.

---

## 📈 Quality & Integrity

The platform is rigorously tested and "Main Stage Stress Tested."

| Check | Result | Standard |
| :--- | :--- | :--- |
| **Web Tests** | ✅ 198/198 Passed | Vitest / RTL |
| **Android Tests** | ✅ 60/60 Passed | JUnit / Turbine |
| **Type Integrity** | ✅ 0 Errors | TypeScript Strict |
| **A11y (Web)** | ✅ Hardened | Skip-links, Landmarks, Focus-visible |
| **AAPT Build** | ✅ Stable | Resource Integrity Verified |

---

## 🏗️ Data Pipeline (DRY)

We use a single source of truth for all data. **`festivals/<id>/data/lineup.json`** flows directly to both platforms without middle-man transformations.

- **Scrape**: `npm run lineup:update:<id>` (Crawls festival sites).
- **Clean**: `scripts/clean-lineup.mjs` (Deduplication & normalization).
- **Vibes**: `scripts/backfill-vibes.mjs` (AI-driven vibe taxonomy).
- **Sync**: `scripts/sync-data.mjs` (Web) & `scripts/sync-android-assets.mjs` (Android).

---

## 📖 Deep Dive Docs
- **[`CURRENT.md`](CURRENT.md)**: Real-time project status and build integrity.
- **[`docs/guides/MANDATES.md`](docs/guides/MANDATES.md)**: The foundational "Laws of the Engine."
- **[`AGENTS.md`](AGENTS.md)**: Onboarding guide for AI agents (Claude, Gemini, Cursor).
- **[`android/README.md`](android/README.md)**: Android-specific architecture and route table.
