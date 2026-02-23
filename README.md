# Sziget Insider 2026 🎪

This is the ultimate, unofficial, offline-first companion app for the Sziget Festival 2026. Built with a "bleeding-edge" stack and designed to be the standout app of the festival season.

## 🚀 Vision
Sziget Insider isn't just a static schedule; it's an AI-powered festival curator and survival toolkit. It bridges the gap between digital convenience and the raw energy of the Island of Freedom.

## ✨ Standout Features
- **AI Scout (Genkit)**: Natural language discovery agent.
- **Spotify Match**: Direct integration to find lineup artists you already love.
- **Vibe Heatmap**: Simulated real-time energy visualization on the map.
- **GPS Tent Finder**: Navigate back to your camp without a signal.
- **Budget Hero**: Highlighted official low-price food options.
- **Clash Detection**: Visual red alerts for overlapping favorite sets.
- *...and 19 more. See [docs/FEATURES.md](docs/FEATURES.md)*

## 🛠 Tech Stack
- **Engine**: Next.js 16.1.6 (Latest Stable)
- **UI Logic**: React 19
- **Styling**: Tailwind CSS 4.0 & MUI 6
- **AI**: Genkit (Gemini 2.5 Flash)
- **Persistence**: LocalStorage (Privacy-first / Offline-first)
- **Icons**: Lucide React & React Icons

## 📁 Project Structure
```text
src/
├── app/           # Next.js App Router (Pages & API)
├── ai/            # Genkit flows and AI prompt logic
├── components/    # Atomic UI and composite modules
├── data/          # JSON data (Lineup, Food, POI)
├── hooks/         # Custom React hooks (Favorites, Mobile detection)
├── lib/           # Utility functions & API clients
└── scripts/       # Data management & Scrapers
```

## 📖 Documentation
- [Architecture Deep Dive](docs/ARCHITECTURE.md) - How the engine works.
- [Feature Matrix](docs/FEATURES.md) - Details on the 25 core features.
- [Data Maintenance](docs/MAINTENANCE.md) - How to update lineup and vendors.
- [Prompt History](prompts.md) - Context log for LLM iterations.

## 🏃 Quick Start
```bash
npm install
npm run dev
```
Open [http://localhost:9002](http://localhost:9002).
