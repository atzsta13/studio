# Competitive Analysis

---

## The Greencopper Incumbent

The dominant festival app platform in the Austrian market is **Greencopper**, operated by **Nova Music Entertainment GmbH** (the same company that runs both Nova Rock and Frequency). Both festivals ship apps under Greencopper package IDs:

| Festival | Package ID | App Store ID | Developer |
|---|---|---|---|
| Nova Rock | `com.greencopper.novarock` | 1374567174 | Nova Music Entertainment GmbH |
| Frequency | `com.greencopper.fm4` | 1383951321 | Nova Music Entertainment GmbH |

The fact that the operator of both festivals is also the platform developer means Greencopper is a captive B2B relationship — not an open marketplace. Displacing it requires either being adopted as an additional offering alongside Greencopper (companion positioning) or winning an organizer contract (replacement positioning).

### What Greencopper Does Well

- **Timetable with personalization**: build your own schedule, favorite acts, get reminders
- **Push notifications**: artist-go-live alerts, thunderstorm warnings, timetable changes
- **Cashless wallet management**: RFID wristband top-up, balance check, transaction history (via PlayPass/Weezevent integration)
- **Interactive map**: stage locations, facilities, sponsor activations
- **Merch info and artist photo galleries**
- **Offline timetable cache**: works without signal on festival grounds

### What Greencopper Does NOT Do

This is where our app differentiates:

| Feature | Greencopper | Our App |
|---|---|---|
| AI artist recommendations (Gemini) | ❌ | ✅ |
| Spotify artist matching (scan your library) | ❌ | ✅ |
| Vibe DNA quiz (personalized discovery) | ❌ | ✅ |
| Serendipity / random artist discovery | ❌ | ✅ |
| Survival guide (practical tips) | ❌ | ✅ |
| Offline-first PWA (web) | ❌ | ✅ |
| Cashless RFID wallet | ✅ | ❌ (deep-link out) |
| Real-time push notifications | ✅ | ❌ |
| Live timetable updates | ✅ | ❌ (static JSON) |

**Our competitive angle is discovery and engagement, not operations.** Greencopper is the operational layer (schedule, cashless, logistics). We are the discovery layer (find your artists, gamify the experience, personalize the journey).

---

## Festival-by-Festival Competitive Position

### Sziget 2026 — Owned Space

- No official Sziget app exists
- No Greencopper deployment
- This is the strongest position: no competition, 90k+ daily attendees, 7-day engagement window
- Risk: Sziget could build their own app or license Greencopper. Monitor.
- **Strategy**: Ship a best-in-class experience. Build the reputation that matters when Sziget's organizers look at the market.

### Area 53 — Greenfield

- No existing app (as of March 2026)
- ~10,000 attendees, metal niche
- Highest probability of quick adoption: organizers currently have zero digital presence
- **Strategy**: Approach the organizer directly. Offer a white-label version of our app as an official companion tool. Revenue model: flat annual license fee.


- Greencopper is the incumbent (`com.greencopper.novarock`)
- Estimated 100k+ app installs (extrapolated from ~50k/day attendance × multi-day)
- Users already have an operational app: asking them to install a second app requires clear added value
- **Strategy**: Position as the discovery companion, not the operational replacement. Messaging: "Know the lineup before you go. The Greencopper app runs the festival; the Nova Rock Insider Scout helps you find your artists."
- **Key differentiator to push**: AI + Spotify matching. "Scan your Spotify library → find the 12 Nova Rock acts you already love but didn't know were playing."
- **Long-term play**: If Greencopper's contract with Nova Rock is renewed annually, there's a window to pitch as a premium upgrade or integration partner.


- Same Greencopper platform as Nova Rock
- FM4 (Austrian public radio) co-branding gives the festival an editorial/curatorial identity that Greencopper doesn't leverage
- **Strategy**: Position as the FM4-aligned discovery tool. "Frequency isn't just a festival, it's FM4's annual curatorial statement. Our app is the editorial companion — AI-driven recommendations that reflect the FM4 vibe."
- **Daypark/Nightpark gap**: Greencopper's timetable is a flat list. Our app (once Frequency is built) would have a Daypark/Nightpark mode toggle — a UX advantage for Frequency's unique two-phase structure.
- **Target**: FM4 editorial team or marketing as an integration partner, not just the festival organizer.

---

## Feature Comparison Table (Detailed)

| Feature | Our App | Greencopper | Notes |
|---|---|---|---|
| **Discovery** | | | |
| AI artist recommendations | ✅ Gemini 2.5 Flash | ❌ | Our flagship differentiator |
| Spotify library scan → matches | ✅ | ❌ | "12 artists you already love are playing" |
| Vibe DNA quiz | ✅ | ❌ | Personalized genre/mood profiling |
| Serendipity (random discovery) | ✅ | ❌ | "Surprise me" button |
| **Engagement** | | | |
| Home screen widget | ✅ | ❓ Unknown | Android Glance widget |
| **Operations** | | | |
| Full timetable with stage/time | ✅ (when data exists) | ✅ | Tied; Greencopper has real-time updates |
| Personalized schedule builder | ✅ (via favorites) | ✅ | Tied |
| Cashless RFID wallet | ❌ (deep-link only) | ✅ | Greencopper's core strength |
| Push notifications (go-live alerts) | ❌ | ✅ | Greencopper's core strength |
| Interactive venue map | ✅ (dot map) | ✅ | Tied; Greencopper may have more POIs |
| Offline map | ✅ (static) | ✅ | Tied |
| **Practicalities** | | | |
| Weather forecast (7-day) | ✅ Open-Meteo | ❌ | Our advantage |
| GPS tent finder | ✅ | ❌ | Our advantage |
| Currency converter (HUF) | ✅ | ❌ | Our advantage (Sziget only) |
| Survival guide | ✅ | ❌ | Our advantage |
| SOS beacon / emergency contacts | ✅ | ❌ | Our advantage |
| **Platform** | | | |
| PWA (web app, no install required) | ✅ | ❌ | Our advantage for web reach |
| Android native | ✅ | ✅ | Tied |
| iOS native | ❌ | ✅ | Greencopper advantage |
| Offline-first | ✅ (service worker) | Partial | Our advantage |

> **iOS gap**: The web PWA covers iOS users. A native iOS app (SwiftUI) would be Phase 6+ and is not in scope for the initial white-label work.

---

## Go-to-Market Strategy

### Phase 1: Prove the Model (Area 53)

- Build Area 53 as the first white-label deployment
- Goal: demonstrate that non-Sziget fans engage with the product

### Phase 2: Pitch with Data (Nova Rock / Frequency)

- Approach Nova Rock and Frequency organizers with Area 53 engagement data
- Frame as supplemental to Greencopper, not competitive: "Your fans still use the Greencopper app for the schedule. They use our app to discover artists before they arrive."
- Offer a free pilot season with one festival

### Phase 3: Monetization Options

| Model | Description | Best For |
|---|---|---|
| **Annual license** | Flat fee per festival per year (e.g. €5k–€20k) | Smaller festivals (Area 53) |
| **Revenue share** | % of a future premium feature (e.g. paid artist playlists) | Larger festivals |
| **Organizer dashboard SaaS** | Recurring subscription for self-serve lineup management | B2B scale (Phase 5+) |
| **Sponsored features** | Brand-activated features (e.g., "Presented by Red Bull Stage") | Festivals with large sponsor budgets (Nova Rock) |

### Messaging Framework

**For festival-goers**: "Discover your lineup before you arrive. Match your Spotify. Find your vibe. Track your festival journey."

**For festival organizers**: "Increase pre-festival engagement, extend the festival experience beyond the gates, and give your most passionate fans a tool that makes them come back every year."

**Against Greencopper**: "Greencopper runs the festival. We make it an experience."

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Sziget launches official app | Medium | High | Build community moat before; position as fan-made |
| Greencopper expands feature set (adds AI/Spotify) | Low | Medium | First-mover advantage; deeper integration with our specific festivals |
| Area 53 organizer doesn't respond to outreach | Medium | Low | Still a valid public web deployment; drives proof-of-concept |
| Nova Rock/Frequency users won't install second app | High | Medium | PWA removes install friction; Spotify match is compelling enough hook |
| iOS gap hurts adoption | Medium | Medium | Web PWA covers iPhone; track iOS PWA installs vs Android native |
