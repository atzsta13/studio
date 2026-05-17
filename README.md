# 🎪 Festival Insider Platform

A professional, high-performance **White-Label Engine** for festival companion apps. Built for the elite attendee who demands a better experience than the official apps.

---

## ⚡ Core Mandates
- **100% OFFLINE FIRST**: Map, Guide, Lineup, and AI tools work with zero signal.
- **NO ACCOUNTS**: Zero logins, zero emails, zero tracking. 100% anonymous utility.
- **NO SOCIAL**: No feeds, no moderation, no "photo walls." Strictly P2P local group sync.
- **CONFIG DRIVEN**: One engine, 5+ festivals. Branding and data are decoupled from the UI.

---

## 🗺️ Supported Festivals

| Festival | ID | Platform Status |
| :--- | :--- | :--- |
| **Sziget 2026** | `sziget-2026` | ✅ Production Ready |
| **Nova Rock 2026** | `novarock-2026` | ✅ Production Ready |
| **Frequency 2026** | `frequency-2026` | ✅ Production Ready |
| **Area 53 2026** | `area53-2026` | ✅ Production Ready |
| **Ernte Punk 2026** | `ernte-punk-2026` | ✅ Production Ready |

---

## 🚀 Execution

The platform uses a **Monolithic Hub Architecture** for Web and **Product Flavors** for Android.

### **Web (The Strategic Hub)**
Run the monolithic portal serving all festivals dynamically:
```bash
npm install
npm run dev
# Open http://localhost:3000 (Global Hub)
# Open http://localhost:3000/sziget-2026 (Specific Festival)
```

### **Android (The Tactical Edge)**
Build dedicated, high-performance APKs for on-site survival:
```bash
cd android
./gradlew assembleSzigetDebug      # Build Sziget flavor
./gradlew assembleNovarockDebug    # Build Nova Rock flavor
./gradlew test                     # Run all unit tests
```

---

## 🛠️ Tactical Capabilities
- **Acoustic Scout**: Local AI inference to identify sets based on vibe (No data leaves device).
- **Vibe DNA DNA Quiz**: Gamified artist matching without a Spotify login.
- **Survival Toolkit**: HUF converter, Weather, SOS Beacon, Tent Finder, Car Finder.
- **Squad Link**: Anonymous group syncing via local QR code swap (P2P).
- **Food Radar**: Pre-sorted by price and dietary needs.

---

## 🏗️ Technical Stack

| Component | Technology |
| :--- | :--- |
| **Web Core** | Next.js 16 / React 19 / TypeScript (Strict) |
| **Styling** | Tailwind CSS 4 / Brutalist UI Kit |
| **Android** | Jetpack Compose / Kotlin 2.0 / Room (v8) |
| **AI Layer** | Google Genkit / Gemini 1.5 Flash (Cloud) / Gemma 4 (Local) |
| **Philosophy** | Offline-First / Manual DI / Functional UI |

---

## 📖 Essential Documentation
- **[docs/guides/MANDATES.md](docs/guides/MANDATES.md)**: Foundational rules (No Accounts, No Camera).
- **[AGENTS.md](AGENTS.md)**: Context for AI agents (Claude, Gemini, Cursor).
- **[CURRENT.md](CURRENT.md)**: Real-time project state and build integrity.
- **[android/README.md](android/README.md)**: Android route table and repository patterns.
