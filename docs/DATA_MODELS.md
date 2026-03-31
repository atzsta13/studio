# Data Models Dictionary

**Last updated:** 2026-03-31
**Scope:** All data types used in lineup.json, configuration, databases, and state providers.
**Format:** JSON + Kotlin + TypeScript equivalents

---

## TLDR

- **Source of truth:** `festivals/<id>/config.json` (Branding/Features) + `festivals/<id>/data/lineup.json` (80 artists).
- **Master Registry:** 50+ modular feature toggles in `FestivalFeatureFlags`.
- **State Provider:** `InsiderProvider` (React Context) manages global modes & storage isolation.
- **Nullability:** Many fields are optional (stage/time data pending).

---

## Table of Contents

1. [Festival Config (Master)](#festival-config)
2. [Artist (Lineup)](#artist-lineup)
3. [User Progress & Achievements](#user-progress)
4. [POI & Map Pins](#poi-point-of-interest)
5. [Food & Merch](#food-and-merch)
6. [Connectivity & Power](#connectivity-and-power)

---

## Festival Config (Master)

**Source:** `festivals/<id>/config.json`
**Used by:** Entire platform (Web + Android)

### JSON Schema (Excerpt)

```json
{
  "id": "sziget-2026",
  "theme": {
    "primaryHex": "#FF0080",
    "aesthetic": "brutalist"
  },
  "features": {
    "hydrationTracker": true,
    "sosMorseCode": true,
    "clashResolver": true,
    "batterySaver": true
  }
}
```

### Modular Feature Registry

| Field | Type | Description |
|:---|:---|:---|
| `hydrationTracker` | boolean | Toggles water intake circle logic |
| `sunscreenAlert` | boolean | Toggles UV dynamic banner |
| `clashResolver` | boolean | Toggles timetable overlap detection |
| `batterySaver` | boolean | Toggles global CSS animation suppression |
| `isOnline` | boolean | Live connectivity status from InsiderProvider |

---

## Artist (Lineup)

**Source:** `src/data/lineup.json` (Synced from `festivals/<id>/data/`)

### JSON Schema

```json
{
  "id": "1",
  "artist": "Afrojack",
  "stage": "Main Stage",
  "day": "Thursday",
  "startTime": "2026-08-06T22:00:00",
  "endTime": "2026-08-06T23:30:00",
  "genres": ["ELECTRONIC", "HOUSE"],
  "vibes": ["Energy", "Dance"],
  "imageUrl": "https://media.appmiral.com/..."
}
```

---

## User Progress & Achievements

**Storage:** `localStorage` (Web - isolated by festival ID) / Room DB (Android)

### Achievement Model

```typescript
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}
```

### Storage Isolation Logic

All keys are prefixed via `InsiderProvider.getStorageKey(key)` to prevent cross-festival data contamination.
- Key: `${FESTIVAL.id}-favorites`
- Key: `${FESTIVAL.id}-hydration`

---

## POI (Point of Interest)

**Source:** `src/data/poi.json`

### New Types (Hyper-Insider)

| Type | Description |
|:---|:---|
| `accessibility` | Wheelchair ramps and accessible zones |
| `quiet-zone` | Low-decibel areas for sensory relief |
| `charging` | Power point locations |
| `water` | Free refill stations |

---

## Food and Merch

**Source:** `src/data/food.json` / `Mock Merch Array`

### Merch Item Schema

```typescript
{
  "id": "merch-1",
  "name": "Official Hoodie",
  "price": 18000,
  "category": "Apparel",
  "watchlist": boolean // Controlled by user per-item
}
```

---

## Connectivity and Power

### Battery Saver State
- **CSS**: `.battery-saver` class on `body` disables:
  - `animation`, `transition`, `backdrop-filter`, `text-shadow`, `box-shadow`.

### Offline Mode
- **State**: `navigator.onLine` monitored by `InsiderProvider`.
- **UI**: `OfflineBanner` renders destructively when `false`.

---

## Related Files

- `src/config/festival.ts` — TypeScript definitions
- `festivals/**/config.json` — Raw configuration
- `src/components/insider-provider.tsx` — State controller
- `src/hooks/use-clash-resolver.ts` — Tactical logic
