# 🏛️ Architecture Overview

The Festival Insider Platform is a **Config-First, Offline-First** white-label engine. It uses a single data source to power both a monolithic planning hub (Web) and tactical survival tools (Android).

## 1. Core Philosophy
- **Main Stage Certified**: Every feature must function perfectly with **0 bars of signal** and 100,000 people nearby.
- **Config-Driven**: One engine, multiple festivals. Branding and data are decoupled from UI logic.
- **No Cloud / No Account**: 100% anonymous utility. No server-side social features or external AI calls.

## 2. Technical Stack

| Layer | Web (The Strategic Hub) | Android (The Tactical Edge) |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Jetpack Compose / Kotlin 2.0 |
| **State** | React Context (InsiderProvider) | ViewModel + StateFlow |
| **Storage** | localStorage (scoped by id) | Room (v8) + SharedPreferences |
| **Styling** | Tailwind CSS 4 + Brutalist UI | Material 3 + Custom Brutalist Kit |
| **AI** | N/A (Disabled for Privacy) | Local Gemma 4 (MediaPipe) |

## 3. Data Pipeline (DRY)
The platform uses a unified JSON schema for all data. Source data lives in `festivals/<id>/data/`.

- **`lineup.json`**: Source of truth for all artists. Unified schema (`artist` key).
- **`config.json`**: Branding, feature flags, and localization.
- **`poi.json`**: Map points (stages, water, first aid).

## 4. Platform Specialization

### **Web (Planning & Search)**
- Serves all festivals dynamically via `/[festivalId]`.
- Global search across all festival lineups.
- Pre-festival vibe discovery and planning.

### **Android (On-Site Survival)**
- Build-time product flavors for specialized APKs.
- Heavy focus on offline performance and battery saving.
- Hardware-linked features: GPS Tent Finder, SOS Beacon, Acoustic Scout.

## 5. Security & Privacy
- **Zero Signal**: All data assets are bundled or aggressively cached.
- **Anonymous**: No login required. Group syncing (**Squad Link**) is strictly P2P via QR.
- **Encryption**: Future priority for local-only data sensitive fields.
