# FM4 Frequency Festival — White-Label Spec


---

## Festival Profile

| Property | Value |
|---|---|
| Full Name | FM4 Frequency Festival |
| Year | 2026 |
| Dates | August 20–22, 2026 (Thursday–Saturday) |
| Duration | 3 days |
| Venue | Green Park Traisen |
| Address | St. Pölten, Lower Austria |
| GPS | 48.2088°N, 15.6360°E |
| Timezone | Europe/Vienna (UTC+2 summer) |
| Capacity | ~50,000/day, ~140,000 total |
| Stages | Space Stage (main), Green Stage + Nightpark areas (3–4 stage zones) |
| Genre | Mainstream alternative — rock, indie, hip-hop, pop, EDM. Daypark/Nightpark split. |
| Currency | EUR |
| Founded | 2001 |
| Website | https://www.frequency.at/en/ |
| Existing App | ✅ **Yes** — Greencopper (`com.greencopper.fm4`, App Store 1383951321) |
| Co-brand | FM4 Austrian Public Radio (Österreichischer Rundfunk) |
| Cashless | ✅ PlayPass/Weezevent (same system as Nova Rock) |
| Camping | Yes — standard + glamping (deluxe tents with private facilities) |
| Family Zone | No dedicated family area |

---

## Competitive Context

Frequency shares the Greencopper platform with Nova Rock — both operated by Nova Music Entertainment GmbH. The same competitive analysis applies (see `08_COMPETITIVE_ANALYSIS.md`).

**The FM4 differentiator**: Frequency is co-produced with FM4, Austria's public alternative radio station. FM4 has a distinct editorial identity — a curated, culturally opinionated voice in Austrian alternative music. This identity is what makes Frequency different from a generic large-format festival.

**Opportunity**: Greencopper's app is operational (schedule, cashless, map). It has no editorial voice. The gap is the FM4 curatorial angle: "why these artists, what do they mean, how do they connect." Our AI recommendation layer fills that gap.

---

## The Daypark / Nightpark Concept

Frequency has a unique structural split that creates a distinct UX requirement:

- **Daypark**: Daytime programming on the Space Stage and Green Stage — rock, indie, alternative, mainstream pop. Runs ~14:00–22:00.
- **Nightpark**: Nighttime electronic/DJ-focused programming in separate tent/arena structures. Runs ~22:00–05:00.

This means the festival functions as two different events with partially different audiences. A rock fan might only attend Daypark. An EDM fan might arrive after dark.

**UX requirement**: The timetable screen needs a **Daypark / Nightpark toggle** — a mode switch that filters acts by their `timeSlot` field (`'daypark'` or `'nightpark'`). This is gated behind `FestivalConfig.features.dayparkNightparkMode` and is a Frequency-exclusive feature.

**Data schema addition** (backward-compatible):
```typescript
// In LineupItem:
timeSlot?: 'daypark' | 'nightpark' | null
```

All other festivals set this to `null`. Frequency's lineup.json should populate it once the schedule is published.

**Web implementation sketch:**
```tsx
// Only rendered when FESTIVAL.features.dayparkNightparkMode === true
function DayparkNightparkToggle({ filter, onChange }: Props) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onChange('daypark')}
        className={filter === 'daypark' ? 'bg-primary text-white' : 'bg-muted'}>
        ☀️ DAYPARK
      </button>
      <button onClick={() => onChange('nightpark')}
        className={filter === 'nightpark' ? 'bg-primary text-white' : 'bg-muted'}>
        🌙 NIGHTPARK
      </button>
    </div>
  )
}
```

---

## App Aesthetic

| Token | Value | Notes |
|---|---|---|
| `primaryHex` | `#8B00FF` | Electric purple — FM4 editorial energy |
| `primaryHsl` | `272 100% 50%` | |
| `accentHex` | `#00FF88` | Electric green — Nightpark energy |
| `accentHsl` | `152 100% 50%` | |
| `secondaryHex` | `#FF00AA` | Hot pink — pop/indie crossover |
| `secondaryHsl` | `319 100% 50%` | |
| `backgroundHex` | `#09090B` | OLED black |
| `glowColor` | `rgba(139, 0, 255, 0.4)` | Purple glow |
| `aesthetic` | `'mainstream'` | |

**Design language**: Vibrant and colourful relative to the other festivals. Purple/green/pink palette reflects the Daypark (purple) → Nightpark (green) energy progression. The aesthetic should feel more modern and pop-adjacent than Sziget's brutalist style or Area 53's heavy metal darkness.

---

## Feature Flags

| Feature | Enabled | Reasoning |
|---|---|---|
| `currencyConverter` | ❌ | EUR festival |
| `tentFinder` | ✅ | Large camping including glamping |
| `vibeQuiz` | ✅ | Broad genre range → quiz is very relevant |
| `spotifyIntegration` | ✅ | Mainstream pop/rock fans → high Spotify usage |
| `aiRecommendations` | ✅ | ~70–80 acts, diverse genres → AI adds value |
| `survivalGuide` | ✅ | Austrian practical guide |
| `timetable` | ❌ initially | Activate when schedule published |
| `cashlessLink` | ✅ | Link to PlayPass wallet top-up |
| `cashlessUrl` | `https://www.frequency.at/en/cashless/` | |
| `dayparkNightparkMode` | ✅ | **Frequency-specific**: Daypark/Nightpark toggle |
| `familyZone` | ❌ | No dedicated family area |

---

## AI Persona

```
the 'Frequency Scout', a St. Pölten regular who has attended Frequency
since the early FM4 days and knows every act on both the Space Stage
and the Nightpark floors. You have the taste of a passionate FM4 listener —
you appreciate the curatorial vision behind the lineup. You help fans
navigate a genuinely diverse programme spanning rock, indie, hip-hop,
and electronic across the Daypark and Nightpark.
```

The AI should be able to help with cross-genre discovery specific to Frequency's programming logic: a rock fan asking "what should I see after the main stage closes" should get good Nightpark recommendations.

---

## Glamping Note

Frequency offers glamping tiers (deluxe tents with private restrooms and showers). This is a data model consideration — the `guide.json` should have a glamping section, and the `FoodVendor.location` descriptions may reference glamping zones.

No new schema fields needed — just content in guide.json and food.json.

---

## Lineup Data Notes

- ~70–80 artists expected for 2026
- Space Stage + Green Stage (Daypark) + Nightpark venues
- `timeSlot` field: `'daypark'` or `'nightpark'` — required for Frequency, null for others
- Days: Thursday–Saturday (3 days)
- FM4 Austrian/German-language act quota: ~30–40% local artists
- `festivalUrl` format: `https://www.frequency.at/en/lineup/<artist-slug>`
- Scraper target: `https://www.frequency.at/en/lineup`

---

## Survival Guide Key Points

```json
[
  {
    "id": "arrival",
    "title": "Getting There",
    "icon": "Train",
    "tips": [
      { "id": "a1", "text": "Train from Vienna (Wien Hbf) to St. Pölten Hbf takes ~30 min. Regular services run throughout the day.", "importance": "high" },
      { "id": "a2", "text": "Shuttle buses run from St. Pölten Hbf to the festival grounds. Free with ticket wristband.", "importance": "high" },
      { "id": "a3", "text": "Driving: St. Pölten is on the A1 motorway, ~65 km west of Vienna. Festival parking available.", "importance": "medium" }
    ]
  },
  {
    "id": "cashless",
    "title": "Cashless Wristband",
    "icon": "CreditCard",
    "tips": [
      { "id": "ca1", "text": "Frequency is cashless — charge your PlayPass wristband online before arrival.", "importance": "critical" },
      { "id": "ca2", "text": "Top-up stations at festival entrance if you forgot, but queues are long on Thursday.", "importance": "high" },
      { "id": "ca3", "text": "Remaining balance is refundable after the festival via the PlayPass website.", "importance": "medium" }
    ]
  },
  {
    "id": "daynight",
    "title": "Daypark vs Nightpark",
    "icon": "Sun",
    "tips": [
      { "id": "dn1", "text": "Daypark (Space Stage + Green Stage): runs ~14:00–22:00. Rock, indie, pop acts.", "importance": "high" },
      { "id": "dn2", "text": "Nightpark: separate venue area, opens ~22:00 until ~05:00. Electronic, DJ sets.", "importance": "high" },
      { "id": "dn3", "text": "The walk between Daypark and Nightpark areas is ~5–10 min. Know the site layout.", "importance": "medium" },
      { "id": "dn4", "text": "Some acts cross over both (e.g. a DJ set from a rock artist in the Nightpark). Check the full schedule.", "importance": "low" }
    ]
  },
  {
    "id": "camping",
    "title": "Camping & Glamping",
    "icon": "Tent",
    "tips": [
      { "id": "c1", "text": "Standard camping: bring your own tent. Campsites are near the Traisen river — beautiful but can be damp.", "importance": "medium" },
      { "id": "c2", "text": "Glamping: pre-erected deluxe tents with beds, power, and private shower/toilet. Book early — sells out.", "importance": "medium" },
      { "id": "c3", "text": "Free microwave stations on the campsite for reheating personal food.", "importance": "low" }
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency",
    "icon": "Shield",
    "tips": [
      { "id": "e1", "text": "European emergency number: 112", "importance": "critical" },
      { "id": "e2", "text": "Austrian police: 133 | Ambulance: 144 | Fire: 122", "importance": "critical" }
    ]
  }
]
```

---

## Differentiation Against Greencopper (Frequency Specific)

**1. The FM4 editorial angle**
> "FM4 doesn't just book bands — they curate a statement about what Austrian alternative culture sounds like in 2026. Our AI Scout has absorbed that curation logic. Ask it anything."

**2. Daypark/Nightpark mode**
> "Our timetable knows the difference between the Space Stage and the Nightpark. The Greencopper app doesn't have a mode switch. We do."

**3. Spotify matching across genres**
> "With ~80 acts spanning rock, hip-hop, and techno, most fans don't know half the lineup. One Spotify scan, and we'll tell you which 20 acts are already in your library."

---

## Data Package Readiness

| Item | Status | Notes |
|---|---|---|
| Festival config object | ✅ Ready | See `02_CONFIG_SYSTEM.md` |
| `lineup.json` schema | ✅ Ready | `timeSlot` field added |
| `lineup.json` data | ⏳ Pending scrape | `npm run lineup:update:frequency` |
| `poi.json` | ⏳ Pending | Daypark + Nightpark zones need separate POI sets |
| `food.json` | ⏳ Pending | Multiple food courts across Daypark/Nightpark |
| `guide.json` | ⏳ Draft above | Daypark/Nightpark section is essential |
| Venue map | ⏳ Pending | Must show both Daypark and Nightpark areas |
| App icon | ⏳ Pending | Purple branded |
| OG image | ⏳ Pending | 1200×630 branded image |
