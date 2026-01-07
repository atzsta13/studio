# **App Name**: Sziget Insider 2026

## Core Features:

- Schedule Grid: Display festival schedule in a grid format with stages as columns and time as rows, sourced from `lineup.json`.
- Favorites Management: Allow users to 'heart' artists and store their favorites in `localStorage` for offline access.
- Conflict Detection: Detect and visually warn users about overlapping favorite artists in the schedule.
- Interactive Map: Load a static map image and provide clickable pins for key locations within the festival.
- Survival Guide: Offer instant-loading static pages for essential information (Shuttle Bus, Camping Rules, Emergency Numbers).
- Offline Configuration: Configure `vite-plugin-pwa` with a 'NetworkFirst' strategy for HTML and 'CacheFirst' for assets. The `manifest.json` theme color is `#222051`.
- Firestore Initialization: Initialize Firebase for potential read-only updates. Using `localStorage` for the 'Favorites' feature to ensure offline reliability

## Style Guidelines:

- Background: Midnight Navy (#222051) to set a unique, dark, and immersive tone, contrasting against standard blacks.
- Primary Text: Sziget Yellow (#FFF53C) for high-contrast headers and text, ensuring readability and vibrancy.
- Accents: Deep Violet (#AA1E8C) to highlight interactive elements like borders, active states, and buttons, providing clear visual cues.
- Soft UI: Peach (#FFD2C1) used for card backgrounds and secondary elements, adding warmth and retro flair.
- Alerts: Pink (#FF7387) for error states and conflict warnings, immediately drawing the user's attention.
- Font: 'Varela Round' (sans-serif) from Google Fonts. Note: currently only Google Fonts are supported.
- Use `lucide-react` icons throughout the app to maintain a consistent and clean aesthetic.
- Feature-based project structure: `/schedule`, `/map`, `/guide` to organize components effectively.
- Subtle animations on the `ScheduleGrid` component. For example highlighting artists with an opacity change as they come into focus, creating a more engaging experience.