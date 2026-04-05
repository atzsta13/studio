# Festival Expansion Strategy

Planning document. No implementation yet — this is the theory and groundwork for expanding beyond Sziget.

---

## What every festival has in common

Every festival on earth shares the same core problems:

1. **Discovery** — 80+ acts, who do I actually see?
2. **Survival** — lost, dehydrated, broke, can't find friends
3. **Logistics** — getting there, sleeping, packing, spending

These three problems map directly to the app's existing feature set. The core is already generic. What's festival-specific is the *configuration* wrapped around that core.

---

## What makes each festival genuinely different

These are the variables that would need to be parameterized per festival:

### Venue type — changes UX fundamentally

| Type | Examples | Key implication |
|------|---------|----------------|
| Island | Sziget | Limited entry/exit, water surrounds you |
| Farm / greenfield | Glastonbury, Bonnaroo | Mud risk, camping mandatory, sprawling |
| Urban park | Lollapalooza, Wireless, BST Hyde Park | Day-ticket only, go home each night |
| Desert | Coachella, EDC Las Vegas | Heat management critical, car culture |
| Fortress / historic | EXIT (Novi Sad) | Navigation nightmare, beautiful |
| Racetrack | Download, Rock am Ring | Industrial, good roads, no mud |

### Camping — binary feature split

- **Full camping**: tent finder, charging stations, campsite rules, quiet hours, lost-in-field navigation
- **No camping**: transport home at 2am, hotel recs, day-bag packing list
- **Glamping**: tiered access, pre-pitched zones

### Duration

- Day festival (BST Hyde Park) — completely different planning mindset
- Weekend (Coachella, Reading) — 3 days, manageable
- Week+ (Glastonbury 5 days, Sziget 7 days) — budget tracking matters, fatigue management

### Currency situation

| Scenario | Festival examples | App response |
|---------|-----------------|-------------|
| Local cash (convert at ATMs) | Sziget (HUF), Exit (RSD) | Currency converter (current feature) |
| Festival-specific tokens | Tomorrowland (Pearls) | Token converter instead |
| Full RFID cashless wristband | Glastonbury, many UK festivals | Top-up station locator, balance check |
| Card everywhere | Most US festivals | Remove converter, add ATM map |

### Weather profile — changes what "survival" means

| Profile | Festivals | Key features |
|---------|---------|-------------|
| UK mud | Glastonbury, Leeds, Download | Wellies checklist, board-over-mud tips |
| Desert heat | Coachella, EDC LV | UV index, hydration alerts, shade map |
| Humid subtropical | New Orleans Jazz Fest | Heat + humidity, heatstroke signs |
| Nordic cold nights | Roskilde, Flow | Layering advice, hypothermia awareness |
| Mediterranean | Primavera, Benicàssim | Sunscreen, late-night warmth drop |

### Genre identity — changes discovery UX

| Genre focus | Festivals | Implication |
|------------|---------|------------|
| Electronic only | Tomorrowland, Creamfields, EDC | Set times > artist discovery; DJ b2b matters |
| Metal only | Wacken, Hellfest, Download | Subgenre filtering (death/black/thrash/doom) |
| Hip-hop | Wireless, Rolling Loud | Features vs sets; guest appearances; no fixed end times |
| Genre-agnostic | Sziget, Glastonbury, Primavera | Current app — maximum discovery value |

### Official app quality — competitive landscape

| Festival | Official app | Opportunity |
|---------|-------------|------------|
| Coachella | Excellent (AEG invest heavily) | Low — don't compete here first |
| Glastonbury | Decent | Medium |
| Tomorrowland | Good within their ecosystem | Low — insular |
| Reading/Leeds/Download/Creamfields | Mediocre (Live Nation neglect) | **High** |
| EXIT, Untold, Balaton Sound, Open'er | Terrible or none | **Highest** |
| Bonnaroo, Lollapalooza | Mediocre | High (US market) |

---

## The ownership reality

Most large festivals in Europe and North America are owned or promoted by a handful of companies:

**Live Nation / Ticketmaster** (largest): Lollapalooza, Bonnaroo, ACL, Reading, Leeds, Download, Creamfields, Wireless, Latitude, Parklife, All Points East, Rock Werchter, Primavera Sound, Isle of Wight, ~50 others.
Their own app is primarily a ticketing app — useless for survival/discovery. This is the market gap.

**AEG / Goldenvoice**: Coachella, Stagecoach, BST Hyde Park.

**Independent / nonprofit**: Glastonbury, Roskilde (nonprofit since 1972), Sziget (Hungarian private company), Tomorrowland (Belgian, independent).

**Key insight:** Corporate ownership does NOT mean data standardization. Each festival still runs its own website, CMS, and app regardless of parent company. Affiliation doesn't give you a unified API.

---

## Festival landscape by region

### Europe (priority target)

**UK** — large, well-established, Live Nation neglect = opportunity:
Glastonbury · Reading · Leeds · Download · Creamfields · Wireless · Latitude · Parklife · All Points East · BST Hyde Park · Isle of Wight · Boomtown

**Belgium** — strong festival culture, multilingual:
Tomorrowland · Rock Werchter · Pukkelpop · Dour

**Netherlands**:
Lowlands · Defqon.1 · Pinkpop · Best Kept Secret

**Germany**:
Wacken · Hurricane · Southside · Rock am Ring · Rock im Park · Lollapalooza Berlin · Melt! · Helene Beach

**Spain**:
Primavera Sound · Mad Cool · Sonar · FIB (Benicàssim)

**France**:
Hellfest · Les Vieilles Charrues · Download Paris

**Nordics**:
Roskilde (DK) · NorthSide (DK) · Flow (FI) · Way Out West (SE)

**Central/Eastern Europe** — worst official apps, best opportunity:
Sziget (HU) · Balaton Sound (HU) · EXIT (RS) · Untold (RO) · Open'er (PL) · Pohoda (SK) · Colours of Ostrava (CZ)

**Southern Europe**:
NOS Alive (PT) · Super Bock Super Rock (PT)

**Scotland**:
TRNSMT

### North America

**USA**:
Coachella (CA) · Stagecoach (CA) · Lollapalooza (IL) · Bonnaroo (TN) · ACL (TX) · EDC Las Vegas (NV) · Ultra (FL) · Rolling Loud (FL) · Governors Ball (NY) · Firefly (DE) · Outside Lands (CA) · Pitchfork (IL) · Hangout (AL) · New Orleans Jazz Fest (LA) · Life is Beautiful (NV)

**Canada**:
Osheaga (QC) · VELD (ON) · Ottawa Bluesfest

---

## Expansion strategy

### Phase 1 — Same data pipeline, new config
Festivals using **Appmiral** as their CMS (same CDN as Sziget — `imageUrl` fields point to `appmiral.com`). The lineup scraper could be reused or lightly adapted. Check which European festivals run on Appmiral.

### Phase 2 — Central/Eastern Europe first
EXIT (Serbia), Untold (Romania), Balaton Sound (Hungary), Pohoda (Slovakia), Open'er (Poland). All have mediocre or no companion apps. Biggest opportunity per effort. Many share similar festival culture to Sziget.

### Phase 3 — UK Live Nation properties
Download, Creamfields, Latitude, Wireless. Live Nation neglects these. Dedicated fanbase, English-language, no language barrier.

### Phase 4 — US market
Bonnaroo (camping-heavy — your tools fit well), Lollapalooza (urban — different feature set needed), ACL (urban, two weekends).

### Skip for now
Coachella (excellent official app, extremely competitive), Glastonbury (strong official app), Tomorrowland (self-contained ecosystem with their own app investment).

---

## What would need to change in the codebase

All festival-specific constants now live in `data/config/FestivalConfig.kt`. To support a new festival:

### Must change
- `FestivalConfig.kt` — name, dates, timezone, currency, day list
- `android/app/src/main/assets/lineup.json` — new lineup data
- `android/app/src/main/assets/poi.json` — new POI locations
- `data/content/SurvivalGuideContent.kt` — festival-specific guide sections

### Likely needs changing
- `android/app/src/main/assets/food.json` — new food vendors
- App name and package (if distributing as separate app per festival)

### Does NOT need changing
- All screen composables (they now read from FestivalConfig)
- ViewModels and repositories
- Room database schema
- UI theme and design system
- Haptic system
- Navigation

### New features needed per festival type

| Festival type | New features to build |
|-------------|----------------------|
| `hasCamping: true` | Tent finder, campsite rules, quiet hours, charging station map |
| `cashlessRFID: true` | Top-up station locator, replace currency converter |
| `festivalToken: "Pearls"` | Token converter instead of local currency |
| `weatherProfile: "mud"` | Wellies checklist, poncho reminder, mud map layer |
| `weatherProfile: "desert"` | UV index widget, hydration timer, shade map |
| Urban / no camping | Transport home guide, cloakroom map, day-bag packing list |

---

## The multi-festival app architecture (future)

If expanding to many festivals, the app would need:

1. **Festival selector at launch** — pick from a list, downloads or bundles festival-specific data
2. **Dynamic config loading** — `FestivalConfig` becomes a data class loaded from JSON, not a hardcoded object
3. **Festival-specific asset bundles** — lineup, map, POIs, guide content per festival
5. **A backend** — cross-festival data sync, push notifications, lineup update delivery

None of this is needed yet. The current architecture (single festival, fully offline, no backend) is the right starting point.
