# Festival Insider Platform

A high-performance, offline-first white-label engine for festival companion apps. Originally built for **Sziget Festival**, this platform now supports multiple festivals via a unified configuration-driven architecture.

| Supported Festivals | Status | ID |
|--------------------|--------|----|
| **Sziget 2026** | ✅ Live | `sziget-2026` |
| **Area 53** | 🔵 Phase 1 | `area53-2026` |
| **Nova Rock 2026** | 🔵 Phase 1 | `novarock-2026` |
| **Frequency 2026** | 🔵 Phase 1 | `frequency-2026` |

## 🎯 Philosophy & Strategy

The Festival Insider Platform is designed as a dual-purpose ecosystem:

*   **Web: The Strategic Hub** — Built for **Planning & Discovery**. A monolithic portal (`/`) to compare all festivals in the ecosystem, search global lineups, and scout vibes before buying a ticket.
*   **Android: The Tactical Edge** — Built for **On-Site Survival & Identity**. High-performance native flavors with hardware-linked AI (Acoustic Scout), 100% offline-first utility, and haptic-driven feedback for high-density, 0-signal environments.

---

## 🚀 Getting Started

The platform uses a **Monolithic Hub Architecture**. A single deployment serves all festivals dynamically via URL routing (e.g., `/sziget-2026`, `/novarock-2026`). The root `/` serves as the Global Discovery Hub.

### **Web (Next.js)**
Just run the development server. All configured festivals are available automatically:
```bash
npm run dev
# Visit http://localhost:3000 to see the Hub
# Visit http://localhost:3000/sziget-2026 for a specific festival
```

### **Android (Jetpack Compose)**
Android uses Gradle Product Flavors to build dedicated APKs per festival:
```bash
# Build Sziget debug APK
./gradlew assembleSzigetDebug

# Build Frequency release APK
./gradlew assembleFrequencyRelease
```

---

## 🛠️ Project Navigation
- **[docs/guides/DEVELOPER_QUICKSTART.md](docs/guides/DEVELOPER_QUICKSTART.md)**: ⚡ **Developer Quickstart** (Start here for local setup).
- **[docs/architecture/white-label/README.md](docs/architecture/white-label/README.md)**: 🗺️ **White-Label Roadmap & Architecture**.
- **[STATUS.md](STATUS.md)**: Current health, state, and recent milestones.
- **[PROJECT_MAP.md](docs/architecture/PROJECT_MAP.md)**: High-level overview of where the "brains" are.
- **[SCHEMA.md](docs/architecture/SCHEMA.md)**: Data structure definitions for Lineup, POI, and Guide data.

---

## 💎 Platform Capabilities

- **AI Artist Discovery** — Personalized scouting using Google Genkit based on user mood and preferences.
- **Spotify Integration** — ⚠️ *Suspended* — Spotify API closed public access. See `docs/features/SPOTIFY_INTEGRATION.md`.
- **Vibe DNA Quiz** — A gamified mood quiz that curates a personal short-list of artists.
- **Tactical Map** — High-performance SVG map with coordinate-mapped POIs (water, food, stages).
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
| **Android** | Jetpack Compose / Kotlin / Room (manual factory pattern, no DI framework) |
| **AI Layer** | Google Genkit / Gemini 1.5 Flash |
| **Data** | Offline-first JSON bundles / LocalStorage |

---

## Documentation

| Doc | What it covers |
|-----|---------------|
| [`docs/architecture/white-label/`](docs/architecture/white-label/) | **Multi-festival migration and spec details.** |
| [`CLAUDE.md`](CLAUDE.md) | Instructions for AI agents working in this repo. |
| [`android/README.md`](android/README.md) | Android architecture and product flavor setup. |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Full dual-platform architecture deep dive. |
| [`docs/guides/UI_GUIDE.md`](docs/guides/UI_GUIDE.md) | Design system: colors, typography, component rules. |
