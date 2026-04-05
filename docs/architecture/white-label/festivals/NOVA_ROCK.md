# Nova Rock Festival — White-Label Spec


---

## Festival Profile

| Property | Value |
|---|---|
| Full Name | Nova Rock Festival |
| Year | 2026 |
| Dates | June 11–14, 2026 (Thursday–Sunday) |
| Duration | 4 days |
| Venue | Pannonia Fields II |
| Address | Nickelsdorf, Burgenland, Austria (near Hungarian border) |
| GPS | 47.9381°N, 17.0651°E |
| Timezone | Europe/Vienna (UTC+2 summer) |
| Capacity | ~50,000/day, ~200,000 total |
| Stages | 5 (including new 5th stage and Red Bull Stage in 2026) |
| Genre | Rock, metal, metalcore, alternative, punk — broad hard rock |
| Currency | EUR |
| Founded | 2005 |
| Website | https://www.novarock.at/en/ |
| Existing App | ✅ **Yes** — Greencopper (`com.greencopper.novarock`, App Store 1374567174) |
| Cashless | ✅ PlayPass/Weezevent RFID wristband |
| Camping | Yes — eco-friendly green camping option (introduced 2026) |
| Family Zone | Yes — kids under 6 free, family area on site |

---

## Competitive Context

Nova Rock is served by the **Greencopper** platform, operated by Nova Music Entertainment GmbH (the same company that runs the festival). This is a captive relationship — Greencopper is both vendor and operator.

**What Greencopper gives Nova Rock fans:**
- Personalized timetable builder with act reminders
- Push notifications (artist go-live, timetable changes, thunderstorm warnings)
- Cashless wristband top-up and balance check (PlayPass integration)
- Interactive site map
- Merch info and artist galleries
- Offline timetable cache

**What Greencopper does NOT give them:**
- AI-driven artist discovery
- Spotify library → lineup matching
- Vibe DNA quiz for pre-festival discovery
- Survival guide

**Strategy**: **Companion app, not a replacement.** We cannot and should not try to displace Greencopper's cashless and operational features. We position as the discovery and engagement layer that Greencopper explicitly doesn't serve.

**Pitch to organizer**: "Your Greencopper app runs the festival. Our app gets fans excited before they arrive and keeps them engaged after they leave."

---

## App Aesthetic

| Token | Value | Notes |
|---|---|---|
| `primaryHex` | `#FF6600` | Nova Rock orange — energetic, rock energy |
| `primaryHsl` | `24 100% 50%` | |
| `accentHex` | `#FFD700` | Gold — classic rock/metal accent |
| `accentHsl` | `51 100% 50%` | |
| `secondaryHex` | `#FF4444` | Red secondary — energy and intensity |
| `secondaryHsl` | `0 100% 63%` | |
| `backgroundHex` | `#09090B` | OLED black |
| `glowColor` | `rgba(255, 102, 0, 0.4)` | Orange glow |
| `aesthetic` | `'rock'` | |

**Design language**: Bold, high-energy, stadium-rock feel. Orange-gold palette evokes fire and concert lighting. Less angular than metal — more muscular and direct.

---

## Feature Flags

| Feature | Enabled | Reasoning |
|---|---|---|
| `currencyConverter` | ❌ | EUR festival |
| `tentFinder` | ✅ | Large camping grounds |
| `vibeQuiz` | ✅ | Rock/metal vibe discovery |
| `spotifyIntegration` | ✅ | Rock fans use Spotify heavily |
| `aiRecommendations` | ✅ | 100+ acts → AI discovery very valuable |
| `survivalGuide` | ✅ | Practical guide for large-scale camping festival |
| `timetable` | ❌ initially | Static JSON; activate when schedule published |
| `cashlessLink` | ✅ | Deep-link to PlayPass wristband top-up |
| `cashlessUrl` | `https://www.novarock.at/en/cashless/` | |
| `dayparkNightparkMode` | ❌ | No day/night split at Nova Rock |
| `familyZone` | ✅ | Family area info, kids-under-6 note |

---

## Cashless Deep Link

Nova Rock uses PlayPass (a Weezevent company) for RFID cashless payments. The festival's official cashless top-up URL is `https://www.novarock.at/en/cashless/`. The app should link out to this URL from the Tools screen rather than attempting to implement cashless in-app.

```tsx
// In ToolsScreen or CashlessCard component:
{FESTIVAL.features.cashlessLink && (
  <a
    href={FESTIVAL.features.cashlessUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="..."
  >
    Top Up Wristband →
  </a>
)}
```

On Android, open with `Intent(Intent.ACTION_VIEW, Uri.parse(config.cashlessUrl))`.

---

## AI Persona

```
the 'Nova Rock Scout', a rock veteran who has survived every Pannonia
dust storm since 2005 and knows all five stages by heart. You help fans
discover the perfect bands for them at Nova Rock Festival 2026.
You speak with the authority of someone who has seen Metallica, Rammstein,
and Green Day on this same field. For 100+ acts, you cut through the noise.
```

The AI responses should feel authoritative and rock-knowledgeable — reference stage sizes (main vs small stage), genre crossovers (metal fans who might love a metalcore act), and the festival's heritage.

---

## Lineup Data Notes

- 100+ acts expected for 2026 (largest lineup of the four festivals)
- 5 stages including Red Bull Stage (new in 2026)
- Days: Thursday–Sunday (4 days)
- Stage assignments and times not available until schedule published
- `festivalUrl` format: `https://www.novarock.at/en/lineup/<artist-slug>`
- Scraper target: `https://www.novarock.at/en/lineup/`

---

## Survival Guide Key Points

```json
[
  {
    "id": "arrival",
    "title": "Getting There",
    "icon": "Train",
    "tips": [
      { "id": "a1", "text": "Train from Vienna (Wien Hbf) to Nickelsdorf takes ~45 min. Direct regional services run during festival.", "importance": "high" },
      { "id": "a2", "text": "Dedicated shuttle buses from Nickelsdorf station to festival grounds run continuously.", "importance": "high" },
      { "id": "a3", "text": "Driving: Nickelsdorf is directly off the A4 motorway. Follow festival signage for parking fields.", "importance": "medium" },
      { "id": "a4", "text": "From Hungary: Nickelsdorf is just across the border from Hegyeshalom. ~1h from Budapest by car.", "importance": "medium" }
    ]
  },
  {
    "id": "cashless",
    "title": "Cashless Wristband",
    "icon": "CreditCard",
    "tips": [
      { "id": "ca1", "text": "Nova Rock is 100% cashless — no cash or cards accepted inside the festival grounds.", "importance": "critical" },
      { "id": "ca2", "text": "Top up your PlayPass wristband online before arrival to avoid queues at the gate.", "importance": "critical" },
      { "id": "ca3", "text": "Top-up stations available at festival entrance but expect queues especially Thursday.", "importance": "high" },
      { "id": "ca4", "text": "Unused balance can be refunded after the festival via the PlayPass website.", "importance": "medium" }
    ]
  },
  {
    "id": "camping",
    "title": "Camping",
    "icon": "Tent",
    "tips": [
      { "id": "c1", "text": "The Pannonia Fields site is flat and exposed — wind can be brutal. Bring tent pegs and a mallet.", "importance": "high" },
      { "id": "c2", "text": "Eco Green Camping (new 2026): eco-friendly zone with recycling stations and solar-powered lighting.", "importance": "medium" },
      { "id": "c3", "text": "Partyzone runs 24h — camp far away if you need sleep.", "importance": "medium" }
    ]
  },
  {
    "id": "emergency",
    "title": "Emergency",
    "icon": "Shield",
    "tips": [
      { "id": "e1", "text": "European emergency number: 112", "importance": "critical" },
      { "id": "e2", "text": "Austrian police: 133 | Ambulance: 144 | Fire: 122", "importance": "critical" },
      { "id": "e3", "text": "Festival medical centre is marked on the map. Free first aid available.", "importance": "high" }
    ]
  },
  {
    "id": "trash",
    "title": "Trash Return",
    "icon": "Recycle",
    "tips": [
      { "id": "t1", "text": "Trash Return programme: deposit €10 at entrance, reclaim it by returning bags of sorted waste.", "importance": "medium" },
      { "id": "t2", "text": "Running since 2010. Roughly 30% of attendees participate.", "importance": "low" }
    ]
  }
]
```

---

## Differentiation Against Greencopper (Nova Rock Specific)

When pitching to Nova Rock fans or organizers, lead with these three angles:

**1. Pre-festival discovery**
> "Greencopper shows you when bands play. We help you figure out which of the 100+ bands you actually want to see — before you even pack your bag."

**2. Spotify matching**
> "Scan your Spotify library in 30 seconds. Find out which Nova Rock 2026 acts you already know and love — maybe you'll discover 15 acts you didn't realize were on the lineup."


---

## Data Package Readiness

| Item | Status | Notes |
|---|---|---|
| Festival config object | ✅ Ready | See `02_CONFIG_SYSTEM.md` |
| `lineup.json` | ⏳ Pending scrape | `npm run lineup:update:novarock` |
| `poi.json` | ⏳ Pending | 5-stage complex needs careful coordinate mapping |
| `food.json` | ⏳ Pending | BILLA Food Stage + other vendors |
| `guide.json` | ⏳ Draft above | Cashless section is critical content |
| Venue map | ⏳ Pending | Pannonia Fields layout needed |
| App icon | ⏳ Pending | Orange rock branded |
| OG image | ⏳ Pending | 1200×630 branded image |
