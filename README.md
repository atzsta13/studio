# 🎪 Festival Insider Platform

A white-label, **offline-first** engine for festival companion apps. Built to survive 100,000+ people, direct sunlight, and **0 bars of signal**.

**Live:** https://atzsta13.github.io/studio/

---

## ⚡ Core Pillars
- **100% OFFLINE FIRST**: Every tactical feature (Map, Timetable, Guide, Local AI) works without internet.
- **NO ACCOUNTS**: Zero logins, zero tracking. 100% anonymous.
- **NO SOCIAL**: Strictly P2P local group sync via **Squad Link**. No feeds, no moderation liability.
- **NO CLOUD AI**: All intelligence is local inference (on-device Gemma, Android only). Zero data leaves the device.
- **CONFIG DRIVEN**: One engine, six festivals. Branding and data are decoupled from the UI layers.

---

## 🗺️ Festivals

| Festival | ID | Artists | Timetable |
| :--- | :--- | :--- | :--- |
| **Sziget** | `sziget-2026` | 458 | ✅ Aug 9–16 |
| **Nova Rock** | `novarock-2026` | 84 | ✅ Jun 11–14 |
| **Rock am Ring** | `rock-am-ring-2026` | 73 | ✅ Jun 5–7 |
| **Area 53** | `area53-2026` | 30 | ✅ Jul 15–18 |
| **Frequency** | `frequency-2026` | ~95 | ⏳ TBA |
| **Ernte Punk** | `ernte-punk-2026` | ~17 | ⏳ TBA |

---

## 🚀 Architecture

Two parallel platforms synchronized by a unified data pipeline. No backend, no API routes, no server.

### 1. Web
Next.js 16 / React 19 static export (`output: 'export'`), deployed to GitHub Pages. All festivals served from one app via `/[festivalId]/`.
```bash
npm install
npm run dev        # http://localhost:9002
```

### 2. Android
Native Jetpack Compose app. **Single APK** (`com.example.festivalinsider`) with all festival data bundled — the user picks their festival on first launch.
```bash
cd android
./gradlew assembleDebug   # build APK
./gradlew test            # unit tests, no device needed
```

---

## 🛠️ Feature Highlights

- **Timetable**: pixel-accurate vertical time grid — stage filters, favorites filter, clash detection, live/past set states, now-line.
- **Discovery**: Vibe Quiz, Serendipity roulette, similar artists, genre DNA — all offline, no Spotify login.
- **Survival Toolkit**: offline POI map, tent/car finder (GPS pin), SOS morse beacon, hydration/sunscreen reminders, currency converter, weather cache.
- **Squad Link**: anonymous group syncing via local QR swap (P2P, no server).

---

## 📈 Quality Gates

```bash
npm run typecheck     # 0 errors
npm run lint          # 0 errors
npm test -- --run     # 189 tests, keep green
```

---

## 🏗️ Data Pipeline

Source of truth: `festivals/<id>/data/*.json` → synced to `public/data/` (web) and `android/app/src/main/assets/` (Android) via `npm run lineup:sync`.

- **Scrape**: `npm run lineup:update:<id>`
- **Clean**: `scripts/clean-lineup.mjs`
- **Vibes**: `scripts/backfill-vibes.mjs`
- **Sync**: `scripts/sync-data.mjs` + `scripts/sync-android-assets.mjs`

---

## 📖 Docs
- [`AGENTS.md`](AGENTS.md) — rules, commands, and architecture for AI agents (canonical entry point)
- [`TASKS.md`](TASKS.md) — open and unfinished work
- [`docs/STATUS.md`](docs/STATUS.md) — live project state
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) — deep technical reference
- [`docs/GOALS.md`](docs/GOALS.md) — the why behind every feature
- [`android/README.md`](android/README.md) — Android architecture and routes
