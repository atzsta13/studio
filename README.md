# Sziget Insider 2026 🎪

This is the ultimate, unofficial, offline-first companion app for the Sziget Festival 2026. Built with a bleeding-edge stack and designed to be the standout "Intelligence Layer" of the festival.

## 🚀 Mission
To empower every "Szitizen" with an intelligent survival and discovery engine that works anywhere—even with zero signal. No cloud database, no tracking, 100% privacy.

## ✨ The "Elite 50" Features
- **🧠 AI Scout (Genkit)**: Natural language discovery agent powered by Gemini 2.5.
- **🎵 Spotify Match Engine**: Sync your library to find acts you already love on the lineup.
- **📍 GPS Tent Finder**: Navigate back to camp with offline GPS and bearing logic.
- **🔥 Vibe Heatmap & Density**: Real-time energy and crowd visualization on the map.
- **📅 Clash Detection**: Visual alerts for overlapping favorite sets in your grid.
- **🛡️ Survival Toolkit**: SOS Beacon, Currency Converter, UV Safety, and Safe Check-In.
- **🇭🇺 Hungarian Survival**: Integrated phrasebook for navigating local interactions.
- **🏆 Island Quests & Passport**: Gamified exploration with digital stamps and achievements.
- **📔 Memory Log**: A private, local-only festival diary for your best moments.
- **📲 QR Spot Share**: Generate offline QR codes to share your location with friends.

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
- [🌟 Feature Matrix](docs/FEATURES.md) - Details on all 50 core features.

## 🏃 Quick Start
```bash
npm install
npm run build
npm run dev
```
Open [http://localhost:9002](http://localhost:9002).

*Note: Requires `GOOGLE_GENAI_API_KEY` in `.env` for AI features.*
