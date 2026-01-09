# **App Name**: Sziget Insider 2026

## Core Features:

- **Schedule Grid**: Display festival schedule in a grid format with stages as columns and time as rows, sourced from `lineup.json`.
- **Favorites Management**: Allow users to 'heart' artists and store their favorites in `localStorage` for complete offline access.
- **Conflict Detection**: Detect and visually warn users about overlapping favorite artists in the schedule.
- **Interactive Map**: Load a static map image with clickable pins for key locations.
- **Survival Guide**: Instant-loading static pages for essential information (Shuttle Bus, Camping Rules, Emergency Numbers).
- **Data Strategy**: Entirely **offline and local**. No user accounts or cloud syncing. Lineup is updated via bundled JSON files.

## Style Guidelines:

- **Primary Colors**:
    - Background: **Midnight Navy** (#222051)
    - Primary Text: **Sziget Yellow** (#FFF53C)
    - Accents: **Deep Violet** (#AA1E8C)
    - Soft UI: **Peach** (#FFD2C1)
    - Alerts: **Pink** (#FF7387)
- **Typography**: 'Outfit' or 'Varela Round' (sans-serif) for a modern, approachable feel.
- **Icons**: `lucide-react` icons for consistency.

## Technical Notes:

- **Framework**: Next.js 15 (App Router).
- **Architecture**: Feature-based project structure (/app/schedule, /app/map, /app/guide).
- **Animations**: `framer-motion` for smooth transitions and interactive elements.
- **Deployment**: Local-first PWA strategy.