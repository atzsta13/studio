# Agent Instructions: Sziget Insider 2026

## Core Philosophy
You are an autonomous AI Agent working on the **Sziget Insider 2026** application. 
Your primary goal is to maintain the **Offline-First**, **High-Performance**, and **Tactical** nature of this repository.

## Strict Rules & Constraints
1. **Offline-First Priority**: DO NOT add any new features that require a live data connection (except the initial Spotify initialization/match). All logic MUST run entirely offline client-side.
2. **Data Sourcing**: All festival data (lineups, schedules, food, POIs) comes exclusively from static files in `/src/data/*.json`. DO NOT map to external REST/GraphQL APIs.
3. **Storage**: All user-generated data (Favorites, Memories, Quest Progress, XP, GPS Coordinates) must be stored strictly natively via `localStorage`.
4. **No Unverifiable Bloat**: Do not invent locations, lore, or internal navigation logic that cannot be backed by the static `.json` configuration.

## Technical & UX Stack
- **Framework**: **Next.js 16.1.6** (App Router) & **React 19**. Use server components by default unless interactivity (`useState`, `useEffect`) requires `"use client"`.
- **Styling**: **Tailwind CSS v4** combined with **MUI 6** (Material UI) for complex structured grid components (Timetable).
- **Icons**: Use **lucide-react** for general UI and **react-icons/si** for brand logos (Spotify, etc.).
- **Theme**: We use an OLED-dark theme by default to save battery on festival grounds. Refer to `/docs/UI_GUIDE.md` for aesthetics.
- **PWA Architecture**: Keep bundle sizes small. Ensure fast client-side navigation. Leverage `useMemo` for any heavy array filtering (like the 100+ artist lineup).

## Engineering Standards
- **TypeScript**: Always use strict typing. Avoid `any`. Interfaces for components should be explicit.
- **Imports**: Use absolute imports (`@/components/...`, `@/data/...`).
- **File Structure**: Feature components live in `/src/components/[feature]/`, generic utility UI in `/src/components/ui/`, and standard pages in `/src/app/[route]/page.tsx`.

## Provided Resources & Workflows
- **`/docs/UI_GUIDE.md`**: Strict design rules for the 2026 aesthetic.
- **`/docs/FEATURES.md`**: The master matrix of all 34 implemented offline features.
- **`/.agent/workflows/`**: Pre-defined step-by-step procedures for you to run tasks on this repository safely.
