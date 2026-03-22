# Sziget Insider 2026

Unofficial, offline-first festival companion app for [Sziget Festival 2026](https://szigetfestival.com) (Budapest, Aug 6–12).

Two parallel codebases sharing the same lineup data:

| Platform | Stack | Location |
|----------|-------|----------|
| **Web** | Next.js 16 / React 19 / Tailwind CSS 4 | repo root |
| **Android** | Jetpack Compose / Kotlin / Room | `android/` |

---

## 🗺️ Project Navigation
- **[STATUS.md](STATUS.md)**: Current health, state, and recent milestones.
- **[DEVELOPER_QUICKSTART.md](docs/DEVELOPER_QUICKSTART.md)**: Build commands and data flow.
- **[PROJECT_MAP.md](docs/PROJECT_MAP.md)**: High-level overview of where the "brains" are.
- **[SCHEMA.md](docs/SCHEMA.md)**: Data structure definitions.

---

## What this app does

- **Artist discovery** — browse, search, and filter 80 artists by genre, vibe, day, and country
- **Vibe DNA Quiz** — 5-step mood quiz that curates a personal artist shortlist
- **Personal lineup planner** — favorite artists, organize by festival day
- **Tactical map** — water stations, food vendors, and stage locations
- **Island Passport** — gamified stamp collection + XP rank system with challenges
- **Survival toolkit** — HUF currency converter, SOS beacon, emergency contacts, Hungarian phrases
- **Festival survival guide** — transport, camping rules, money tips, connectivity

---

## 🔄 Data Flow
The source of truth for the lineup is `src/data/lineup.json`. To sync this data to the mobile app, run:
```bash
chmod +x sync.sh
./sync.sh
```

---

## Documentation

| Doc | What it covers |
|-----|---------------|
| [`CLAUDE.md`](CLAUDE.md) | Instructions for AI agents working in this repo |
| [`android/README.md`](android/README.md) | Android architecture, patterns, screen inventory |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full dual-platform architecture deep dive |
| [`docs/FEATURES.md`](docs/FEATURES.md) | What's built, what's planned, what awaits data |
| [`docs/UI_GUIDE.md`](docs/UI_GUIDE.md) | Design system: colors, typography, component rules |
| [`docs/PHASE_3_PLAN.md`](docs/PHASE_3_PLAN.md) | Current development roadmap |
| [`docs/PHASE_3_AGENT_MANIFEST.md`](docs/PHASE_3_AGENT_MANIFEST.md) | Atomic agent task specs |
