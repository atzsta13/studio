# 🎪 Open Festival Hub

*Festival apps, but better.*

An open-source, **offline-first** companion for music festivals. Built to survive 100,000+ people, direct sunlight, and **0 bars of signal**.

**Live:** https://atzsta13.github.io/studio/

Most festival apps exist to carry a payment rail — cashless top-up, ticketing, sponsors — and the timetable is what gets you to open them. That's a legitimate product, and for the things it does, the official app is better than this one. But it leaves two gaps: festivals too small to afford an app get nothing at all, and every privacy promise in the category is something you're asked to take on trust.

This project fills those two gaps. Adding a festival costs a pull request, not five figures. And the privacy claim is inspectable rather than asserted — that's the entire point of it being open.

See [`docs/LANDSCAPE.md`](docs/LANDSCAPE.md) for the full survey of who builds festival apps and why these gaps exist.

---

## ⚡ Core Pillars
- **100% OFFLINE FIRST**: Every tactical feature (Map, Timetable, Guide, Local AI) works without internet.
- **NO ACCOUNTS**: Zero logins, zero tracking. 100% anonymous.
- **NO SOCIAL**: Strictly P2P local group sync via **Squad Link**. No feeds, no moderation liability.
- **NO CLOUD AI**: All intelligence is local inference (on-device Gemini Nano, Android only). Zero data leaves the device.
- **CONFIG DRIVEN**: One engine, six festivals. Branding and data are decoupled from the UI layers.
- **NON-COMMERCIAL**: No ads, no sponsored placement, no monetisation.

### What this will never do

> Open Festival Hub will never handle ticketing, payments, cashless wristband top-up, entry scanning, or any function where failure strands an attendee at a gate. Those belong to the official app. This is a companion, not a replacement.

A companion that shows a wrong set time is annoying. A payment system that fails is a catastrophe. We stay on the safe side of that line permanently.

---

## ⚖️ Unofficial, and independent

Open Festival Hub is an independent, unofficial project. It is **not affiliated with, endorsed by, or connected to** any festival, organiser, or app vendor. All festival names and trademarks belong to their respective owners.

Festival data is compiled from festivals' own public announcements. It is hand-verified but can be wrong — when the official app disagrees with us, believe the official app. Corrections are welcome from anyone, including from the festivals themselves: open an issue.

Artist images are never downloaded or re-hosted — every image is hotlinked to its original source and displayed with a visible attribution watermark.

---

## 🗺️ Festivals

| Festival | ID | Artists | Timetable |
| :--- | :--- | :--- | :--- |
| **Sziget** | `sziget-2026` | 451 | ✅ Aug 9–16 |
| **Nova Rock** | `novarock-2026` | 84 | ✅ Jun 11–14 |
| **Rock am Ring** | `rock-am-ring-2026` | 73 | ✅ Jun 5–7 |
| **Area 53** | `area53-2026` | 32 | ✅ Jul 16–18 |
| **Frequency** | `frequency-2026` | 82 | ✅ Aug 20–22 |
| **Ernte Punk** | `ernte-punk-2026` | 17 | ⏳ TBA |

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
Native Jetpack Compose app. **Single APK** (`org.openfestivalhub`) with all festival data bundled — the user picks their festival on first launch.
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
npm test -- --run     # 190 tests, keep green
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
- [`docs/LANDSCAPE.md`](docs/LANDSCAPE.md) — who builds festival apps, and why this one exists
- [`android/README.md`](android/README.md) — Android architecture and routes

---

## 🤝 Contributing

Adding a festival needs **no code** — it's a folder of JSON and a pull request. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

Wrong set times are the bugs that actually cost people bands; corrections are the most valuable small PRs here.

## 📄 Licence

- **Code** — [AGPL-3.0](LICENSE). Copyleft is deliberate: it prevents a closed fork with trackers and ads bolted on.
- **Festival data** in `festivals/**` — [ODbL-1.0](LICENSE-DATA), so derived databases stay open.
