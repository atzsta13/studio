# 🗺️ Project Map

This document highlights the "core logic" files to help developers and AI agents navigate the codebase efficiently.

## 📱 Android (Native Jetpack Compose)
- **`ui/schedule/ScheduleViewModel.kt`**: The "brain" of the timetable. Handles sorting, filtering by day, and complex clash detection.
- **`ui/schedule/ScheduleScreen.kt`**: Advanced 2D scroll/zoom grid with performance culling.
- **`ui/components/DesignSystem.kt`**: The single source of truth for the Brutalist UI tokens.
- **`data/local/UserDao.kt`**: All Room database persistence (Favorites, XP, Stamps).
- **`ui/navigation/Navigation.kt`**: Centralized route definitions and state passing via `SavedStateHandle`.

## 🌐 Web (Next.js 15)
- **`src/ai/flows/recommend-artists-flow.ts`**: The core AI logic using Genkit for personalized artist discovery.
- **`src/lib/spotify.ts`**: Integration logic for Spotify Web API.
- **`src/app/vibe-quiz/`**: The React implementation of the discovery quiz.

## 📊 Data Layer
- **`src/data/lineup.json`**: The **Source of Truth** for the 2026 lineup.
- **`android/app/src/main/assets/lineup.json`**: A copy of the source data used by the mobile app. Sync via `sync.sh`.

## 🛠️ Scripts
- **`src/scripts/scrape_all_artists.js`**: Scraper for the official Sziget website.
- **`update_vibes.js`**: Enrichment script that adds genre/vibe tags to the raw data.
