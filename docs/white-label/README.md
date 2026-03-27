# White-Label Festival App — Documentation Index

This directory contains the planning and technical documentation for converting **Sziget Insider 2026** from a single-festival app into a configurable white-label platform that can be deployed for multiple festivals with minimal per-festival engineering effort.

---

## What "White-Labeling" Means for This Project

The app is not simply re-skinned. The core product — AI artist discovery, Spotify matching, passport/XP gamification, tactical map, survival tools — is festival-agnostic by nature. What is festival-specific is a thin configuration layer:

- **Identity**: name, tagline, logo, color palette
- **Data**: lineup.json, poi.json, food.json, guide.json
- **Geography**: venue coordinates (latitude/longitude for weather), timezone, city
- **Dates**: festival start/end, day names, calendar dates
- **Currency**: local currency code, EUR/USD conversion rates
- **Feature flags**: which tools apply (e.g., currency converter is irrelevant for a card-only festival)
- **AI persona**: the "scout" character that delivers recommendations
- **Branding strings**: displayed in UI, Spotify playlist names, localStorage keys, deep link schemes

Today the app has 93+ hardcoded Sziget/Budapest/HUF strings scattered across both platforms. The white-label work lifts those strings into a single config object per festival, then ensures every consumer reads from that object instead of a literal.

---

## Directory Structure

```
docs/white-label/
├── README.md                  ← this file
├── 01_ARCHITECTURE.md         ← full technical architecture for multi-festival config system
├── 08_COMPETITIVE_ANALYSIS.md ← competitive landscape, Greencopper incumbent analysis, GTM
└── festivals/
    └── nav.ts                 ← (placeholder — per-festival nav config stub)
```

Planned files (created as implementation phases proceed):

```
docs/white-label/
├── 02_FESTIVAL_CONFIGS.md     ← per-festival config objects for all 4 festivals
├── 03_DATA_PIPELINE.md        ← how to produce lineup/poi/food/guide bundles per festival
├── 04_WEB_MIGRATION.md        ← step-by-step web platform migration checklist
├── 05_ANDROID_MIGRATION.md    ← step-by-step Android product flavor migration checklist
├── 06_DEPLOYMENT.md           ← Vercel project setup, env vars, CI/CD per festival
└── 07_ADDING_A_FESTIVAL.md    ← runbook for onboarding a new festival from scratch
```

---

## The Four Festivals at a Glance

| Property | Sziget 2026 | Area 53 | Nova Rock 2026 | Frequency 2026 |
|---|---|---|---|---|
| Location | Budapest, HU | Austria (TBC) | Nickelsdorf, AT | St. Pölten, AT |
| Dates | Aug 6–12, 2026 | TBC 2026 | Jun 18–21, 2026 | Aug 20–22, 2026 |
| Duration | 7 days | ~2 days | 4 days | 3 days |
| Capacity | ~90,000/day | ~10,000 | ~180,000 total | ~170,000 total |
| Genre Focus | Genre-agnostic | Metal/Hard Rock | Rock/Metal/Pop | Pop/Electronic/Rock |
| Currency | HUF | EUR | EUR | EUR |
| Camping | Yes (island) | Yes | Yes | Yes |
| Official App | None | None | Greencopper | Greencopper |
| Opportunity | Owned space | Greenfield | Challenger | Challenger |
| Status | ✅ Live v1 | 🔵 Phase 1 target | 🔵 Phase 2 target | 🔵 Phase 2 target |

### Sziget 2026

The origin festival and current sole deployment. The app was purpose-built for Sziget — a 7-day, genre-agnostic mega-festival on a river island in Budapest. The "Island of Freedom" identity and HUF currency conversion are deeply embedded in the current codebase. No official Sziget app exists, making this the owned space with no direct competition.

### Area 53

A metal/hard rock niche festival in Austria. No existing app. At ~10,000 capacity it is small enough to onboard quickly while proving the white-label model in a second market. The vibe quiz's metal subgenre support and AI persona can be tuned for a heavier audience. First target for Phase 1 white-label expansion.

### Nova Rock 2026

Austria's largest rock festival, held at the Pannonia Fields airfield in Nickelsdorf (near the Hungarian border). Runs June 18–21, 2026. Headliners have historically included Metallica, Rammstein, Green Day, and similarly scaled acts. Currently served by the Greencopper platform (`com.greencopper.novarock`, App Store ID 1374567174). Strategy: companion app positioning — discovery and gamification alongside, not replacing, the operational Greencopper timetable.

### Frequency 2026

A pop/electronic/rock festival co-hosted by FM4 (Austrian public radio). Held at the Salztanzkogel/Festivalgelände in St. Pölten, August 20–22, 2026. The FM4 editorial identity is the defining differentiator — Frequency is as much a cultural/music-media event as a commercial festival. Currently served by the same Greencopper platform as Nova Rock (`com.greencopper.fm4`, App Store ID 1383951321). FM4's music curation angle is the gap our AI discovery layer fills.

---

## Document Links

| Document | Status | Purpose |
|---|---|---|
| [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) | ✅ Complete | Full technical architecture, migration path, component diagram |
| [02_CONFIG_SYSTEM.md](./02_CONFIG_SYSTEM.md) | ✅ Complete | TypeScript + Kotlin config interfaces + all four festival objects |
| [03_DATA_PIPELINE.md](./03_DATA_PIPELINE.md) | ✅ Complete | Schemas, vibe taxonomy, scraper architecture, npm scripts |
| [04_WEB_IMPLEMENTATION.md](./04_WEB_IMPLEMENTATION.md) | ✅ Complete | Per-file web migration guide with before/after code |
| [05_ANDROID_IMPLEMENTATION.md](./05_ANDROID_IMPLEMENTATION.md) | ✅ Complete | Product flavors, FestivalConfig.kt, per-file Android changes |
| [06_PHASE1_IMPLEMENTATION.md](./06_PHASE1_IMPLEMENTATION.md) | ✅ Complete | Numbered task checklist for Phase 1 (config extraction) |
| [07_DEPLOYMENT.md](./07_DEPLOYMENT.md) | ✅ Complete | Vercel projects, GitHub Actions CI/CD, Play Store, Firebase |
| [08_COMPETITIVE_ANALYSIS.md](./08_COMPETITIVE_ANALYSIS.md) | ✅ Complete | Greencopper incumbent, festival-by-festival position, GTM |
| [festivals/AREA_53.md](./festivals/AREA_53.md) | ✅ Complete | Area 53 full spec: config, aesthetic, guide.json, map POIs |
| [festivals/NOVA_ROCK.md](./festivals/NOVA_ROCK.md) | ✅ Complete | Nova Rock full spec: cashless, Greencopper positioning |
| [festivals/FREQUENCY.md](./festivals/FREQUENCY.md) | ✅ Complete | Frequency full spec: Daypark/Nightpark UX, FM4 angle |

---

## Phase Overview

| Phase | Name | One-liner |
|---|---|---|
| **Phase 0** | Research Complete | Codebase audit, competitive analysis, architecture design — no code changes |
| **Phase 1** | Config Extraction | Extract all hardcoded strings to `FestivalConfig` on both platforms; zero new features |
| **Phase 2** | Web Build Pipeline | Env-var-driven config injection on web; `FESTIVAL_ID` selects the festival bundle at build time |
| **Phase 3** | Android Product Flavors | Convert Android build to product flavors; one flavor per festival; independent app store listings |
| **Phase 4** | Area 53 Launch | First live deployment of a non-Sziget festival; full data pipeline, custom theme, AI persona |
| **Phase 5** | Nova Rock + Frequency | Challenger deployments against Greencopper; companion app positioning, FM4 editorial angle |

---

## Current Status

> **Documentation Complete — Ready to Begin Phase 1**
>
> All white-label research, architecture design, competitive analysis, and implementation guides are written and committed. All 11 documents in this directory are complete. No production code has been changed yet — Sziget 2026 is live and unaffected.
>
> Next action: Begin Phase 1 config extraction per `06_PHASE1_IMPLEMENTATION.md`, starting with `src/config/festival.ts` on the web platform and extending `FestivalConfig.kt` on Android.

---

## Prerequisites to Start

Before beginning Phase 1 implementation, the following must be confirmed:

**Repository / tooling:**
- [ ] Node.js 20+, npm 10+ installed
- [ ] Android Studio Ladybug (2024.2.1) or newer
- [ ] Vercel CLI installed and authenticated (`npx vercel whoami`)
- [ ] Google Genkit API key available (`GOOGLE_GENAI_API_KEY`)
- [ ] Spotify developer app registered with redirect URI for each festival domain

**Data:**
- [ ] Area 53 lineup data source identified (official website, organizer contact, or manual entry)
- [ ] Area 53 venue GPS coordinates confirmed (for weather API + tent finder)
- [ ] Area 53 POI data stub created (`festivals/area53/poi.json`)

**Design:**
- [ ] Brand colors confirmed for each new festival (primary, accent, background)
- [ ] Festival logos in SVG format for web (PWA manifest, header)
- [ ] App icon assets at all required Android densities (mdpi → xxxhdpi + adaptive icon)

**Legal / commercial:**
- [ ] Organizer data-sharing agreement or public data license confirmed for each festival's lineup
- [ ] App store developer accounts ready for new bundle IDs (if Android)
- [ ] Spotify app scopes re-verified for playlist name per festival

---

## How to Add a New Festival (10 Steps)

This is a high-level summary. The full step-by-step runbook will live in `07_ADDING_A_FESTIVAL.md`.

**Step 1 — Create the festival data package**
Create `festivals/<slug>/` with four JSON files: `lineup.json`, `poi.json`, `food.json`, `guide.json`. Start from the Sziget templates and adapt to the new festival's actual data.

**Step 2 — Write the web FestivalConfig**
Create `src/config/festivals/<slug>.ts` implementing the `FestivalConfig` interface. Fill in identity, dates (as UTC timestamps), coordinates, currency, days array, AI persona string, and feature flags.

**Step 3 — Write the Android FestivalConfig**
Copy `android/.../data/config/FestivalConfig.kt` into the new product flavor's source set at `android/app/src/<slug>/java/.../data/config/FestivalConfig.kt` and update all constants.

**Step 4 — Set up Android product flavor**
Add the new flavor to `android/app/build.gradle.kts` under `productFlavors`. Set `applicationId`, `versionName`, `resValue` strings, and `manifestPlaceholders` for the deep link scheme.

**Step 5 — Create the festival theme**
For web: add CSS custom property overrides for `--primary`, `--accent`, `--background` in `src/styles/festivals/<slug>.css` and import conditionally based on `FESTIVAL_ID`. For Android: create a `Color.kt` in the flavor source set with the festival's neon palette.

**Step 6 — Configure the AI persona**
Update the `aiPersona` field in the web `FestivalConfig` with a persona string tailored to the festival (e.g., "You are the Area 53 Intel Officer, a veteran of the metal underground..."). The `recommend-artists-flow.ts` already injects this field into the prompt.

**Step 7 — Verify feature flags**
Check the `features` object in the config. Toggle `currencyConverter` (only needed for non-EUR festivals), `tentFinder` (only useful for camping festivals), `vibeQuiz`, `spotifyMatch`, `passport`, `weatherWidget`. Unused features are hidden from the UI automatically.

**Step 8 — Set up Vercel project**
Create a new Vercel project linked to this repo. Set `FESTIVAL_ID=<slug>` environment variable. Add festival-specific `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and `SPOTIFY_REDIRECT_URI`. Deploy and verify the build output renders the correct festival identity.

**Step 9 — Validate end-to-end**
Run through the QA checklist: countdown date, weather location, currency labels, AI persona response, Spotify playlist name, localStorage key prefixes, PWA manifest name, service worker cache name.

**Step 10 — App store submission (Android)**
Build the flavor: `./gradlew assemble<Slug>Release`. Submit to Google Play under the correct bundle ID. Verify the icon, store listing title, and short description reference the correct festival name.
