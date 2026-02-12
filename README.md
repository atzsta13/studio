# Sziget Insider 2026

This is your unofficial, offline-first companion app for the Sziget Festival 2026. Built with Next.js 15 and designed for the best festival experience.

## ✨ Features

*   **Offline-First Experience**: Designed to work even with unreliable island internet.
*   **Full Festival Schedule**: Browse the lineup by day and stage with ease.
*   **Favorites & Conflict-detection**: Heart your favorite artists and get warned about overlapping sets.
*   **Food & Drink Finder**: Searchable directory of food stalls and bars (Vegan/GF filters included).
*   **Survival Guide**: Essential tips, rules, and emergency contacts at your fingertips.
*   **Interactive Map**: Navigate the island with our built-in map.
*   **Smart Packing Checklist**: Don't forget your essentials.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🎪 Lineup Data Management

When Sziget announces new artists:

```bash
npm run lineup:update
```

This scrapes the Sziget website, cleans the data, adds country codes, generates vibes, and shows a summary.

**Full documentation:** [docs/LINEUP.md](docs/LINEUP.md)

### Quick Commands

| Command | Description |
|---------|-------------|
| `npm run lineup:update` | Full update pipeline (scrape → clean → vibes → show) |
| `npm run lineup:scrape` | Scrape new artists from Sziget website |
| `npm run lineup:clean` | Dedupe, fix encoding, add countries |
| `npm run lineup:vibes` | Generate vibe tags |
| `npm run lineup:show` | Display lineup summary |

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 15.2
- **Styling**: Tailwind CSS 4.0 / Shadcn UI / MUI 6
- **Icons**: Lucide React
- **Data**: Local JSON (`src/data/lineup.json`)
- **Scraping**: Puppeteer (Node.js)

## 📁 Project Structure

```
src/
├── app/           # Next.js pages
├── components/    # React components
├── data/          # JSON data files
│   └── lineup.json   # 🎯 Single source of truth for lineup
├── scripts/       # Lineup management scripts
│   ├── scrape_all_artists.js
│   ├── clean_lineup.js
│   └── show_lineup.js
└── ...
```