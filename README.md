# Festival Insider Platform

A high-performance, offline-first white-label engine for festival companion apps. Originally built for **Sziget Festival**, this platform now supports multiple festivals via a unified configuration-driven architecture.

| Supported Festivals | Status | ID |
|--------------------|--------|----|
| **Sziget 2026** | ✅ Live | `sziget-2026` |
| **Area 53** | 🔵 Phase 1 | `area53-2026` |
| **Nova Rock 2026** | 🔵 Phase 1 | `novarock-2026` |
| **Frequency 2026** | 🔵 Phase 1 | `frequency-2026` |

---

## 🚀 Building for a Festival

The platform uses a "Config-First" approach. You select the target festival at build time.

### **Web (Next.js)**
Use the `NEXT_PUBLIC_FESTIVAL_ID` environment variable:
```bash
# Build for Area 53
NEXT_PUBLIC_FESTIVAL_ID=area53-2026 npm run build

# Development mode for Nova Rock
NEXT_PUBLIC_FESTIVAL_ID=novarock-2026 npm run dev
```

### **Android (Jetpack Compose)**
Use Gradle Product Flavors:
```bash
# Build Sziget debug APK
./gradlew assembleSzigetDebug

# Build Frequency release APK
./gradlew assembleFrequencyRelease
```

---

## 🛠️ Project Navigation
- **[docs/DEVELOPER_QUICKSTART.md](docs/DEVELOPER_QUICKSTART.md)**: ⚡ **Developer Quickstart** (Start here for local setup).
- **[docs/white-label/README.md](docs/white-label/README.md)**: 🗺️ **White-Label Roadmap & Architecture**.
- **[STATUS.md](STATUS.md)**: Current health, state, and recent milestones.
- **[PROJECT_MAP.md](docs/PROJECT_MAP.md)**: High-level overview of where the "brains" are.
- **[SCHEMA.md](docs/SCHEMA.md)**: Data structure definitions for Lineup, POI, and Guide data.

---

## 💎 Platform Capabilities

- **AI Artist Discovery** — Personalized scouting using Google Genkit based on user mood and preferences.
- **Spotify Integration** — Match festival lineups against user's top tracks and generate "Must See" playlists.
- **Vibe DNA Quiz** — A gamified mood quiz that curates a personal short-list of artists.
- **Tactical Map** — High-performance SVG map with coordinate-mapped POIs (water, food, stages).
- **Festival Passport** — Gamified stamp collection, XP system, and unlockable ranks.
- **Survival Toolkit** — Currency converters, SOS beacons, and essential local phrases.
- **Dynamic Theming** — Full UI re-skinning (colors, typography, icons) via central config.

---

## 🔄 Data Pipeline
Each festival has its own data package under `festivals/<id>/data/`. The build process automatically syncs this data:
```bash
# Sync data for the active festival
npm run prebuild 
```

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| **Web Core** | Next.js 16 / React 19 / TypeScript |
| **Styling** | Tailwind CSS 4 / CSS Variables Theme |
| **Android** | Jetpack Compose / Kotlin / Room / Hilt |
| **AI Layer** | Google Genkit / Gemini 1.5 Flash |
| **Data** | Offline-first JSON bundles / LocalStorage |

---

## Documentation

| Doc | What it covers |
|-----|---------------|
| [`docs/white-label/`](docs/white-label/) | **Multi-festival migration and spec details.** |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for AI agents working in this repo. |
| [`android/README.md`](android/README.md) | Android architecture and product flavor setup. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full dual-platform architecture deep dive. |
| [`docs/UI_GUIDE.md`](docs/UI_GUIDE.md) | Design system: colors, typography, component rules. |
