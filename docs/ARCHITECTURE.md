# Architecture Deep Dive

This project is built for **Performance**, **Offline Reliability**, and **AI Integration**.

## 1. AI Scouting (Genkit)
The "AI Scout" uses **Genkit** with the `gemini-2.5-flash` model. 
- **Input**: User's natural language mood (e.g., "I want a wild late-night rave").
- **Context**: The flow injects a subset of `lineup.json` (artist, genres, vibes, and short bios).
- **Output**: Structured JSON containing 3-5 artist IDs and "Scout Reasons".
- **File**: `src/ai/flows/recommend-artists-flow.ts`

## 2. Spotify Match Engine
We use a privacy-first matching logic:
- Users authenticate with Spotify (`user-library-read`).
- The API route fetches the user's top/saved tracks.
- Matching happens by comparing Spotify Artist IDs (extracted from the `socials.spotify` field in our data).
- Matches are persisted in local state to highlight acts in the "Discover" view.

## 3. UI Sync (Tailwind 4 + MUI 6)
We maintain a unified theme across two disparate systems:
- **Tailwind 4**: Used for layout, utility spacing, and glass-morphism.
- **MUI 6**: Used for complex components like the Timetable grid and Home cards.
- **Synchronization**: `src/components/mui-registry.tsx` reads the `next-themes` state and updates the MUI palette dynamically.

## 4. Timetable Logic
The grid is a custom CSS Grid implementation:
- **Rows**: Represent 15-minute intervals.
- **Columns**: Represent Stages.
- **Clash Detection**: `use-favorites.ts` calculates overlapping time ranges across favorited items and returns a `conflicts` Set of IDs.

## 5. Offline Strategy
- **Data**: All core festival data is stored in `src/data/*.json`.
- **Media**: Remote images are optimized via `next/image` patterns.
- **Logic**: User state (Favorites, Quests, Packing List) is purely local via `localStorage`.
