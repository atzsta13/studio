# Sziget Insider 2026 🎪

This is the ultimate, unofficial, offline-first companion app for the Sziget Festival 2026. Built with a bleeding-edge stack and designed to be the standout "Intelligence Layer" of the festival.

## 🚀 Mission
To empower every "Szitizen" with an intelligent survival and discovery engine that works anywhere—even with zero signal. 

## ✨ The "Standout 45" Features
- **🧠 AI Scout (Genkit)**: Natural language discovery agent.
- **🎵 Spotify Match**: Sync your library to find acts you already love.
- **📍 GPS Tent Finder**: Navigate back to camp with offline GPS.
- **🔥 Vibe Heatmap**: Real-time energy visualization on the map.
- **📅 Clash Detection**: Visual alerts for overlapping favorite sets.
- **🛡️ Survival Toolkit**: SOS Beacon, Currency Converter, HUF Calculator.
- **🏆 Island Quests**: Gamified exploration and digital passport stamps.
- **📔 Memory Log**: A private, local-only festival diary.
- *...and 37 more. See [docs/FEATURES.md](docs/FEATURES.md)*

## 🛠 Tech Stack
- **Engine**: Next.js 16.1.6 (Latest Stable)
- **UI Logic**: React 19
- **Styling**: Tailwind CSS 4.0 & ShadCN UI + MUI 6
- **AI**: Genkit (Gemini 2.5 Flash)
- **Persistence**: LocalStorage (Privacy-first / Offline-first)

## 📖 Documentation
- [🎯 The Mission](docs/MISSION.md) - Our North Star.
- [🏗️ Architecture](docs/ARCHITECTURE.md) - How the engine works.
- [🚀 Deployment](docs/DEPLOYMENT.md) - How to go live.
- [🛠️ Development](docs/DEVELOPMENT.md) - Tech stack and conventions.
- [🌟 Feature Matrix](docs/FEATURES.md) - Details on all 45 core features.

## 🏃 Quick Start
```bash
npm install
npm run build
npm run dev
```
Open [http://localhost:9002](http://localhost:9002).

*Note: Requires `GOOGLE_GENAI_API_KEY` in `.env` for AI features.*
