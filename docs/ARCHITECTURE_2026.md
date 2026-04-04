# 🏗️ Festival Insider Architecture 2026 (Monolithic Engine)

## 🌌 The "Two-Sided" Strategy
This platform operates on a split-architecture model designed to maximize **SEO/Reach (Web)** and **Tactical Reliability (Android)**.

### 1. Web: The Monolithic Hub (`/[festivalId]`)
The web application is a single Next.js monolith. 
- **The Portal (`/`)**: A premium discovery gateway showcasing all festivals in the ecosystem.
- **Dynamic Routing**: Every festival lives under its own ID (e.g., `/sziget-2026`).
- **Config Injection**: UI components are "dumb" shells. They consume a dynamic `config` object provided by the `InsiderProvider`, which is populated based on the URL.
- **Dynamic Assets**: Lineup and Guide data are fetched client-side from `public/data/[festivalId]/` to ensure the app remains fast and modular.

### 2. Android: The Tactical Survival Tool
Unlike the Web, the Android apps are built as **isolated units** (Product Flavors).
- **Hardened Offline-First**: Every app is optimized for 0% connectivity. 
- **Room Persistence**: Uses a local SQL database to cache the lineup, allowing for "Live Refresh" updates while maintaining 100% offline access.
- **Local AI (Gemma 4)**: A native inference engine (Google AI Edge) allows users to search the lineup using natural language without hitting a server.

---

## 🛠️ Core Technology Stack
- **Web**: Next.js 16 (App Router), Tailwind 4, Framer Motion, Material UI (Registry).
- **Mobile**: Kotlin, Jetpack Compose, Room Database, Google AI Edge SDK.
- **Intelligence**: Gemma 4 E2B (Local), Gemini Flash 2.0 (Cloud fallback).
- **Infrastructure**: Vercel (Web), GitHub Actions (CI/CD - Pending).

---

## 📂 System Directory Structure
```text
/festivals/             # The "Brains" (Source of truth for all data)
  /[festival-id]/
    /config.json        # Theme, features, and metadata
    /data/              # Lineup, POIs, Survival Guide
/src/                   # Web (Next.js) Source
  /app/[festivalId]/    # Dynamic festival routes
  /hooks/               # useFestivalData, useFavorites, etc.
/android/               # Android (Jetpack Compose) Source
  /app/src/[flavor]/    # Festival-specific Android assets
/scripts/               # Cross-platform sync & cleanup logic
```
