# Sziget Insider 2026

Unofficial, offline-first festival companion app for [Sziget Festival 2026](https://szigetfestival.com) (Budapest, Aug 6–12).

Two parallel codebases sharing the same lineup data:

| Platform | Stack | Location |
|----------|-------|----------|
| **Web** | Next.js 16 / React 19 / Tailwind CSS 4 | repo root |
| **Android** | Jetpack Compose / Kotlin / Room | `android/` |

---

## What this app does

- **Artist discovery** — browse, search, and filter 80 artists by genre, vibe, day, and country
- **Vibe DNA Quiz** — 5-step mood quiz that curates a personal artist shortlist
- **Personal lineup planner** — favorite artists, organize by festival day
- **Tactical map** — water stations, food vendors, and stage locations
- **Island Passport** — gamified stamp collection + XP rank system with challenges
- **Survival toolkit** — HUF currency converter, SOS beacon, emergency contacts, Hungarian phrases
- **Festival survival guide** — transport, camping rules, money tips, connectivity

**Not yet available** (data not published by Sziget yet): stage assignments, set times, confirmed food vendors. These fields exist in the data model (`stage`, `startTime`, `endTime` are `null` for all artists) and the UI is designed to receive them without a rewrite.

---

## Data

`src/data/lineup.json` is the single source of truth — **80 artists**, synced to `android/app/src/main/assets/lineup.json`.

Key data availability:
- Name, image, country, genres: **100%** of artists
- Vibes (mood tags): **100%** (backfilled via `scripts/backfill-vibes.mjs` for artists without hand-curated tags)
- Festival day: **~53%** of artists
- Stage, start time, end time: **0%** — not yet published by Sziget

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full data schema.

---

## Web — Quick Start

```bash
npm install
npm run dev          # Dev server → http://localhost:9002
npm run build        # Production build
npm run lint
npm run typecheck

# AI features (Genkit)
npm run genkit:dev   # Required for AI recommendation flow
```

**Required environment variables** (`.env.local`):
```
GOOGLE_GENAI_API_KEY=   # Google AI Studio — required for AI artist recommendations
SPOTIFY_CLIENT_ID=      # Spotify Developer Dashboard — optional, for Spotify match
SPOTIFY_CLIENT_SECRET=  # Spotify Developer Dashboard — optional
NEXT_PUBLIC_BASE_URL=   # Your deployment URL
```

---

## Android — Quick Start

Open `android/` in Android Studio, or from the `android/` directory:

```bash
./gradlew assembleDebug          # Build debug APK
./gradlew test                   # Unit tests
```

Minimum SDK: 26. Target/Compile SDK: 35. No emulator setup needed for most features — all data is bundled.

See [`android/README.md`](android/README.md) for full Android developer guide.

---

## Lineup data pipeline (web)

```bash
npm run lineup:update   # Full pipeline: scrape → clean → vibes → show
npm run lineup:scrape   # Fetch from Sziget website (Puppeteer)
npm run lineup:clean    # Dedup, fix encoding, extract days, add country codes
npm run lineup:vibes    # Generate vibe tags from genres
npm run lineup:show     # Print summary stats

node scripts/backfill-vibes.mjs  # Fill vibes for artists missing tags (genre-based inference)
```

After updating `src/data/lineup.json`, manually copy to `android/app/src/main/assets/lineup.json`.

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
