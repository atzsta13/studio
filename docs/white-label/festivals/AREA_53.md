# Area 53 Festival — White-Label Spec

**Status**: 🟢 Phase 1 target — greenfield, no competing app

---

## Festival Profile

| Property | Value |
|---|---|
| Full Name | Area 53 Festival |
| Year | 2026 |
| Dates | July 16–18, 2026 (Thursday–Saturday) |
| Duration | 3 days |
| Venue | VAZ Schladnitz "Tenne Leoben" |
| Address | Schladnitzstraße 53, 8700 Leoben, Styria, Austria |
| GPS | 47.3769°N, 15.0944°E |
| Timezone | Europe/Vienna (UTC+2 summer) |
| Capacity | ~10,000 attendees |
| Stages | 1 main stage (open-air) + occasional small/local stage |
| Genre | Heavy metal (thrash, death, power, gothic, folk, symphonic) |
| Currency | EUR (no conversion needed) |
| Founded | 2017 |
| Website | https://area53festival.at/en/ |
| Existing App | **None** ← greenfield opportunity |
| Cashless | No |
| Camping | Yes — indoor shelter (400m² dormitory) + Murinsel riverside camping |

---

## Why Area 53 First

1. **No competing app** — pure greenfield. No Greencopper, no official organizer app, nothing.
2. **Established festival** — 9 years old, loyal metal fanbase, proven event.
3. **Simple data model** — 1 stage, ~25 artists, 3 days. Lowest complexity to onboard.
4. **Metal fans are high-loyalty** — passport/XP gamification, vibe quiz, and AI recommendations will resonate strongly with a dedicated niche audience.
5. **Small scale = safe pilot** — if anything goes wrong, it's a 10k-person event, not 90k.

---

## App Aesthetic

| Token | Value | Notes |
|---|---|---|
| `primaryHex` | `#CC0000` | Metal Red — aggressive, strong |
| `primaryHsl` | `0 100% 40%` | |
| `accentHex` | `#FFFFFF` | Pure white for contrast on black |
| `accentHsl` | `0 0% 100%` | |
| `secondaryHex` | `#888888` | Steel grey |
| `secondaryHsl` | `0 0% 53%` | |
| `backgroundHex` | `#09090B` | OLED black (same as Sziget) |
| `glowColor` | `rgba(204, 0, 0, 0.5)` | Red glow on text-glow elements |
| `aesthetic` | `'metal'` | Used by UI to apply style variants |

**Design language**: Angular, heavyweight typography, minimal colour — red is used sparingly for maximum impact (headings, active states, CTAs). Avoid the neon-on-black brutalist aesthetic of Sziget; lean into a darker, heavier feel.

---

## Feature Flags

| Feature | Enabled | Reasoning |
|---|---|---|
| `currencyConverter` | ❌ | EUR festival — no conversion needed |
| `tentFinder` | ✅ | Camping available (indoor shelter + riverside) |
| `vibeQuiz` | ✅ | Metal-tuned with new vibe taxonomy |
| `passport` | ✅ | High-loyalty fans → XP gamification fits |
| `spotifyIntegration` | ✅ | Metal fans follow bands on Spotify |
| `aiRecommendations` | ✅ | Metal discovery persona |
| `survivalGuide` | ✅ | Austrian content (no HUF/Hungarian phrases) |
| `timetable` | ❌ | No schedule data yet |
| `cashlessLink` | ❌ | No cashless system |
| `dayparkNightparkMode` | ❌ | Single venue, no day/night split |
| `familyZone` | ❌ | Metal festival, no dedicated family area |

---

## Vibe Quiz Tuning

The vibe quiz should feel like "The Metal Forge" for Area 53. Metal-specific vibes to feature prominently:

| Vibe Tag | Metal Genres It Maps To |
|---|---|
| `Brutal` | Death Metal, Deathcore |
| `Dark` | Black Metal, Gothic Metal, Doom Metal |
| `Fast` | Thrash Metal, Speed Metal, Metalcore |
| `Heavy` | Doom Metal, Groove Metal, Stoner Metal |
| `Epic` | Power Metal, Symphonic Metal |
| `Melodic` | Power Metal, Folk Metal, Symphonic Metal |
| `Aggressive` | Thrash Metal, Hardcore, Metalcore |
| `Atmospheric` | Black Metal, Progressive Metal, Gothic Metal |
| `Energetic` | Folk Metal, Speed Metal, Thrash Metal |
| `Orchestral` | Symphonic Metal |

The vibe quiz answer options should reflect this: "You want FAST and BRUTAL" → Death/Thrash picks. "You want EPIC and ORCHESTRAL" → Symphonic/Power picks.

---

## AI Persona

```
the 'Area 53 Metal Scout', a battle-hardened metalhead who has attended
every edition since 2017 and knows every riff and corner of the Tenne Leoben.
You help fans discover the perfect bands for their metal appetite at
Area 53 Festival 2026.
```

The AI response style should be direct and passionate — no festival-bureaucrat speak. Reference genre specifics. Recommend based on intensity levels (lighter/heavier, melodic/brutal).

---

## Lineup Data Notes

- ~25 artists confirmed per edition (15+ already confirmed for 2026 as of early 2026)
- All artists will have metal genre tags
- Days: Thursday (Day 1), Friday (Day 2), Saturday (Day 3)
- Single stage means no clashes — simple timetable when data arrives
- `day` and `stage` fields will be `null` until schedule published
- `festivalUrl` format: `https://area53festival.at/en/lineup/<artist-slug>`

---

## Getting There — Survival Guide Key Points

Content for `guide.json`. Full guide.json to be authored before launch.

```json
[
  {
    "id": "arrival",
    "title": "Getting There",
    "icon": "Train",
    "tips": [
      { "id": "a1", "text": "Train from Vienna (Wien Hbf) to Leoben takes ~2.5 hours. Change at Bruck an der Mur.", "importance": "high" },
      { "id": "a2", "text": "Direct trains from Graz to Leoben take ~1 hour. Run frequently.", "importance": "high" },
      { "id": "a3", "text": "The venue (VAZ Schladnitz) is ~2 km from Leoben Hbf — walkable in 25 min or taxi.", "importance": "medium" },
      { "id": "a4", "text": "Driving: Leoben is on the A9 Pyhrn Autobahn. Parking available near venue (confirm on-site signs).", "importance": "medium" }
    ]
  },
  {
    "id": "camping",
    "title": "Camping",
    "icon": "Tent",
    "tips": [
      { "id": "c1", "text": "Indoor dormitory shelter (400m², renovated 2024): no tent required. Bring a sleeping bag.", "importance": "high" },
      { "id": "c2", "text": "Murinsel riverside camping introduced 2025 — scenic but exposed. Check forecast.", "importance": "medium" },
      { "id": "c3", "text": "Showers and WCs renovated on campsite. Queues peak in the morning.", "importance": "medium" }
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency",
    "icon": "Shield",
    "tips": [
      { "id": "e1", "text": "European emergency number: 112", "importance": "critical" },
      { "id": "e2", "text": "Austrian police: 133 | Ambulance: 144 | Fire: 122", "importance": "critical" },
      { "id": "e3", "text": "Medical tent located near festival entrance. First aid is free.", "importance": "high" }
    ]
  },
  {
    "id": "metalrules",
    "title": "Mosh Pit & Stage Safety",
    "icon": "Zap",
    "tips": [
      { "id": "m1", "text": "Mosh pit etiquette: pick up anyone who falls. Immediately.", "importance": "critical" },
      { "id": "m2", "text": "Wear sturdy footwear. Sandals in the pit will end badly.", "importance": "high" },
      { "id": "m3", "text": "Earplugs are not defeat — they keep you in the pit longer. Bring them.", "importance": "high" },
      { "id": "m4", "text": "Wall of death? Move to the side if you're not participating.", "importance": "medium" }
    ]
  },
  {
    "id": "packing",
    "title": "What to Pack",
    "icon": "Package",
    "tips": [
      { "id": "p1", "text": "Layers for Alpine evenings — temperatures drop significantly after sunset.", "importance": "high" },
      { "id": "p2", "text": "Rain gear — Styrian summer weather is unpredictable.", "importance": "high" },
      { "id": "p3", "text": "Cash (EUR) — card acceptance is limited at smaller vendors.", "importance": "medium" },
      { "id": "p4", "text": "Reusable water bottle — free water stations on site.", "importance": "medium" }
    ]
  }
]
```

---

## Map Notes

Venue is a single outdoor ground at VAZ Schladnitz. POI coordinates are estimated percentages pending an actual venue map image.

```json
[
  { "id": "stage-main",   "name": "Main Stage",       "category": "stage",   "mapCoords": { "x": 50, "y": 55 } },
  { "id": "medical-1",    "name": "Medical",           "category": "medical", "mapCoords": { "x": 20, "y": 20 } },
  { "id": "toilet-1",     "name": "Toilets West",      "category": "toilet",  "mapCoords": { "x": 15, "y": 50 } },
  { "id": "toilet-2",     "name": "Toilets East",      "category": "toilet",  "mapCoords": { "x": 80, "y": 50 } },
  { "id": "water-1",      "name": "Free Water",        "category": "water",   "mapCoords": { "x": 50, "y": 30 } },
  { "id": "food-court",   "name": "Food & Drink",      "category": "food",    "mapCoords": { "x": 75, "y": 35 } },
  { "id": "merch-1",      "name": "Merchandise",       "category": "info",    "mapCoords": { "x": 30, "y": 25 } },
  { "id": "camping-main", "name": "Camping / Shelter", "category": "camping", "mapCoords": { "x": 85, "y": 80 } },
  { "id": "exit-main",    "name": "Main Exit",         "category": "exit",    "mapCoords": { "x": 50, "y": 95 } }
]
```

---

## Data Package Readiness

| Item | Status | Notes |
|---|---|---|
| Festival config object | ✅ Ready | See `02_CONFIG_SYSTEM.md` |
| `lineup.json` | ⏳ Pending scrape | Run `npm run lineup:update:area53` once scraper CSS selectors verified |
| `poi.json` | ⏳ Stub ready | Coordinates need verification against actual venue map |
| `food.json` | ⏳ Pending | Vendor list not yet available publicly |
| `guide.json` | ⏳ Draft above | Needs review and expansion |
| Venue map image | ⏳ Pending | Source from official website or request from organizer |
| App icon | ⏳ Pending | Metal Red branded icon needed |
| OG image | ⏳ Pending | 1200×630 branded image |
