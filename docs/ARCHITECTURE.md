# 🏗️ Architecture Deep Dive

Sziget Insider 2026 is built for **Performance**, **Offline Reliability**, and **AI Integration**.

## 1. The Engine
- **Framework**: Next.js 16.1.6 (App Router).
- **UI Logic**: React 19.
- **Styling**: Hybrid approach using **Tailwind CSS 4.0** for layout/utility and **MUI 6** for complex dashboard components and the Timetable grid.
- **Theme Engine**: `next-themes` synchronized with MUI's Palette system via `src/components/mui-registry.tsx`.

## 2. Data Strategy (Offline-First)
- **Static Content**: All festival metadata (Lineup, Food, POIs) is stored in `src/data/*.json`.
- **User State**: All user-generated data (Favorites, Memories, Quest Progress, GPS Coordinates) is stored strictly in `localStorage`. 
- **Privacy**: No user data ever leaves the device, making it 100% private and 100% functional without a network signal.

## 3. AI Intelligence (Genkit)
The "AI Scout" and "Setlist Predictor" use **Genkit** with the `gemini-2.5-flash` model.
- **Flows**: Encapsulated in `src/ai/flows/`.
- **Context Injection**: Lineup data is injected into prompts to keep the AI grounded in the actual 2026 schedule.

## 4. Navigation & UX
- **Mobile-First**: Ergonomic bottom navigation designed for one-handed use in crowds.
- **Tactical UI**: High-contrast "OLED" modes and large touch targets for use in direct sunlight.

## 5. Deployment
The app is designed to be deployed as a static-heavy SSR/ISR hybrid, ensuring that artist pages are pre-rendered for maximum speed while AI features remain dynamic via Server Actions.
