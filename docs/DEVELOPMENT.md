# 🛠️ Development & Tech Stack Guide

This document is the technical "Brain" for developers and LLMs contributing to Sziget Insider.

## 🏗️ Core Engine
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Logic**: React 19
- **Styling**: Tailwind CSS 4.0
- **UI Components**: ShadCN (Radix) + MUI 6 (for complex grid layouts)
- **AI Integration**: Genkit (Google Gemini 2.5 Flash)

## 📁 File Structure Conventions
- `src/app/`: Next.js routes and layouts.
- `src/ai/`: Genkit flows and logic.
- `src/data/`: JSON single-source-of-truth for Lineup, Food, and POIs.
- `src/hooks/`: Reusable logic (useFavorites, useHydration).
- `src/components/ui/`: Atomic ShadCN components.
- `src/scripts/`: Data scrapers and cleaners.

## 🧩 Key Patterns
### 1. Data Persistence
We avoid cloud databases to ensure 100% offline reliability. Use the `localStorage` patterns established in `use-favorites.ts` or `use-hydration.ts`.

### 2. Dual-Theme Sync
The app uses `next-themes` for Tailwind 4. MUI 6 is synchronized via the `MuiRegistry` component which translates CSS variables into the MUI theme object.

### 3. AI Flows
All GenAI logic is encapsulated in `src/ai/flows/`. Prompts use Handlebars templating. Always inject context from `src/data/lineup.json` to keep the AI grounded.

### 4. Hydration Safety
When rendering browser-specific data (like GPS or Flags), use the `isMounted` state pattern or `suppressHydrationWarning` to prevent Next.js mismatches.

## 📝 Code Standards
- **Functional Components**: Use `export default function` syntax.
- **Strict Types**: Always type your data (see `src/types/index.ts`).
- **Lucide Icons**: Primary icon library. Ensure icons are imported individually if HMR module factory errors occur.
