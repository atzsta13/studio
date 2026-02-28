# Sziget Insider 2026 🎪

This is the ultimate, unofficial, offline-first companion app for the Sziget Festival 2026. Built with a bleeding-edge stack and designed to be the standout "Intelligence Layer" of the festival.

## 🚀 Mission
To empower every "Szitizen" with an intelligent survival and discovery engine that works anywhere—even with zero signal. No cloud database, no tracking, 100% privacy.

## ✨ The "Elite 33" Features
- **🧠 AI Scout (Genkit)**: Natural language discovery agent powered by Gemini 2.5.
- **🎵 Spotify Match Engine**: Sync your library to find acts you already love on the lineup.
- **📍 GPS Tent Finder**: Navigate back to camp with offline GPS and bearing logic.
- **📅 Clash Detection**: Visual alerts for overlapping favorite sets in your grid.
- **🛡️ Survival Toolkit**: SOS Beacon, Currency Converter, UV Safety, and Emergency Dials.
- **🏆 Island Passport & XP**: Gamified progression leveling up your profile via local engagement logging.
- **🍔 Budget Hero Finder**: Quickly filter to official, price-capped budget meals across the island.

## 🛠 Tech Stack
- **Engine**: Next.js 16.1.6 (Latest Stable)
- **UI Logic**: React 19
- **Styling**: Tailwind CSS 4.0 & ShadCN UI + MUI 6
- **AI**: Genkit (Gemini 2.5 Flash)
- **Persistence**: LocalStorage (Privacy-first / Offline-first)

## 📖 Documentation & Agent Protocol
- [🤖 Agent Rules](agent.md) - Strict guardrails and philosophy for AI agents configuring this repo.
- [🎨 UI & Design Guide](docs/UI_GUIDE.md) - Specs on our Brutalist OLED neon aesthetic.
- [🎯 The Mission](docs/MISSION.md) - Our North Star.
- [🏗️ Architecture](docs/ARCHITECTURE.md) - How the engine works.
- [🚀 Deployment](docs/DEPLOYMENT.md) - How to go live.
- [🛠️ Development](docs/DEVELOPMENT.md) - Tech stack and conventions.
- [🌟 Feature Matrix](docs/FEATURES.md) - Details on all 33 core features.

## 🏃 Quick Start
```bash
npm install
npm run build
npm run dev
```
Open [http://localhost:9002](http://localhost:9002).

*Note: Requires `GOOGLE_GENAI_API_KEY` in `.env` for AI features.*
