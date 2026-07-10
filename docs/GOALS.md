# Goals — Festival Insider Platform

The purpose of this document is the **why** behind every feature and the platform as a whole. The **what** lives in `docs/features/FEATURES.md`. The **how** lives in `docs/architecture/ARCHITECTURE.md`.

---

## Ecosystem Goal

Most festival apps are marketing tools. They exist to push ticket sales, sponsors, and social shares. They break the moment 100,000 people flood the same cell tower.

This platform is built from the opposite premise: **a festival is a temporary city, and a city needs infrastructure, not marketing.** The app is that infrastructure — anonymous, offline-capable, and genuinely useful in the worst conditions.

The two platforms serve two distinct phases of a festival:

| Platform | When | Core problem it solves |
|----------|------|------------------------|
| **Web (Hub)** | Before the festival, at home or hotel | "There are 458 artists I don't know. Which ones are for me?" |
| **Android (APK)** | On-site, in the crowd | "I have no signal, 12% battery, and I can't find my tent." |

Both are driven by the same data pipeline and config system. One engine, six festivals, no hardcoded branding.

---

## The Three Contexts

Every feature belongs to one of three user situations:

1. **Planning** — At home, weeks before the festival. Plenty of time, WiFi available. Goal: build a personal schedule and set realistic expectations.
2. **Survival** — On-site, crowd around you, signal dead, battery low. Goal: make it through the day intact.
3. **Emergency** — Something has gone wrong. Goal: reach safety or help as fast as possible.

Features that fail in context 2 or 3 are not shipped.

---

## Feature Goals

### Discovery & Lineup

**`vibeQuiz`**
Goal: onboard someone who knows nothing about the lineup. Thirty seconds of music taste questions produces a ranked shortlist of 5–10 matched artists. This is the entry point for casual attendees who won't scroll 458 names.

**`aiRecommendations`** (Android: local Gemma 4; Web: client-side scoring)
Goal: surface hidden gems — mid-bill artists that match your taste but you'd never click on. Distinct from the vibe quiz in that it's continuous: it re-runs as your favorites grow.

**`surpriseRoulette` / Serendipity**
Goal: overcome filter bubble paralysis. One button, one random unfavorited artist. Forces discovery without a multi-step flow.

**`similarArtists`**
Goal: leverage an artist you already know to find others on the same lineup. "You like X → here are 3 others playing this weekend."

**`genreBreakdown`**
Goal: set expectations about what kind of festival this actually is. A chart showing "60% rock, 20% electronic, 20% other" prevents the wrong person from buying a ticket for the wrong festival.

**`vibeAnalysis`**
Goal: reflect your taste fingerprint back at you. After you've saved 10 artists, show which vibes and genres dominate your list. Useful for deciding which day to prioritize.

**`vibeOfTheHour`**
Goal: answer "what should I watch right now?" Uses your vibe profile against the schedule (when available) to suggest the best live act at any given moment.

**`secretStages`** (blocked — needs undisclosed location data)
Goal: create discovery excitement for unannounced acts. Gives hardcore attendees a reason to open the app repeatedly before the festival.

**`afterMovie`**
Goal: answer "what is this festival actually like?" for first-timers. A link to the official recap video is more honest than any marketing copy.

---

### Personal Schedule

**Highlights** (always on)
Goal: replace the paper schedule. Two tiers — `must_see` (I will rearrange my day for this) and `interested` (I'll go if I'm nearby). The entire timetable and clash resolver are built on top of this list.

**`clashResolver`**
Goal: when two must-see artists overlap, show the exact overlap duration and help the user make an informed choice. Prevents decision paralysis in the crowd.

**`setCountdowns`**
Goal: passive time awareness. "Radiohead starts in 23 minutes" replaces checking the paper timetable repeatedly. Reduces the panic of losing track of time.

**`groupSchedules`** (not implemented yet)
Goal: solve the "what should we do together?" problem for groups without a shared server. Compare two people's highlights locally and surface overlaps and clashes.

---

### Tactical Map

**Map** (always on)
Goal: the ground truth of the festival grounds. Stages, water points, first aid, charging stations, quiet zones — all available offline from `poi.json`. This is not decorative; it is the navigation layer for everything else.

**`tentFinder`**
Goal: you will not remember where your tent is at 3am. Drop a GPS pin when you arrive. That's the entire feature. Solves a real, recurring, high-frustration problem.

**`carFinder`**
Goal: same as tent finder but for parking. Pre-festival, not on-site. Drop a pin in the parking lot and find it when you leave Sunday night exhausted.

**`accessibilityMap`**
Goal: show only accessible routes, ramps, accessible toilets, and viewing platforms. Filters the map for users with mobility requirements who need a completely different path through the venue.

**`quietZones`**
Goal: mark designated sensory recovery areas on the map. Relevant for attendees with sensory sensitivities or anyone who needs to decompress mid-day.

**`chargingStations`**
Goal: survival. Show where official charging points are so users can plan battery management proactively rather than scrambling when they hit 5%.

**`firstAidFinder`**
Goal: emergency context. Pre-load the nearest first aid tent so you never have to search "where is medical" on a dead network.

---

### Health & Survival

**`hydrationTracker`**
Goal: festivals kill people from dehydration and heat exhaustion every year. This is a recurring reminder — not a tracker, not a chart. Every N minutes: "Drink water." Simple.

**`sunscreenAlert`**
Goal: same trigger as hydration but for UV protection. Outdoor festival, direct sun, 8 hours. Reapplication reminder prevents burns that ruin the last two days.

**`waterCounter`**
Goal: a simple tally for users who want to track intake quantitatively rather than just receive reminders.

**`audioMonitor`**
Goal: loud stage exposure causes permanent hearing damage. Show the current ambient dB level and warn at thresholds. Informs the decision to use earplugs. No audio is ever stored or transmitted.

**`batterySaver`**
Goal: when the user is at low battery and far from chargers, they need the app to survive more than they need animations. This mode kills visual effects, reduces refresh rates, and strips the UI to text-only — extending useful phone life.

**`highContrast`**
Goal: make the UI readable in direct sunlight. OLED black backgrounds become washed out in daylight. High contrast mode flips to maximum-contrast text-on-dark. Also serves accessibility.

**`sosMorseCode`**
Goal: true last-resort emergency tool. Flash the screen in SOS morse code when shouting and calling don't work. Requires no network, no sound. The one feature that exists purely for the worst-case scenario.

**`survivalGuide`**
Goal: the condensed "don't die at a festival" manual. Rules, what to do if lost, medical info, what you can't bring in. Pre-loaded from `guide.json`. Replaces the booklet most people throw away at the gate.

**`lostAndFound`**
Goal: surface the festival's official lost & found process and contact without requiring a network search. Pre-loaded content.

---

### Practical Tools

**Packing List** (always on)
Goal: reduce pre-festival anxiety and the specific misery of arriving without a poncho. A tiered checklist (essentials, camping, health, electronics) with pre-populated defaults that the user can check off. Persisted locally.

**`budgetTracker`**
Goal: cash-only environments produce spending blindness. Track how much you've spent at food stalls, bars, and merch without a bank app that needs signal. Simple running total with category tags.

**`notesJournal`**
Goal: freeform notepad. Artist names you heard but didn't recognize, your friend's campsite number, the time of a set you want to remember — all things that don't fit a structured feature.

**`festivalDictionary`**
Goal: international attendees arrive not knowing local slang, facility names, or festival-specific terminology. "What's a day ticket?" "Where is the Silent Stage?" Pre-loaded from `config.json` per festival.

**`shuttleTimetable`**
Goal: the official bus/train schedule from the city to the festival grounds and back, pre-loaded. Solves the "how do I get back at 2am?" question without signal.

**`weatherRadar`**
Goal: show the multi-day forecast for festival duration so attendees can plan which days to be at the front of the main stage (dry) and which to keep near covered stages (wet).

**`currencyConverter`**
Goal: international tourists at Sziget arrive with euros and need to think in Hungarian forints. A simple offline converter eliminates the mental overhead of every transaction.

**`cashlessLink`**
Goal: direct link to the festival's wristband top-up page. One tap, no searching. Prevents the frustration of a dead wristband at the bar.

---

### Social (Local / P2P Only)

**`squadLink` / `friendFinder`**
Goal: share your highlights list with a friend standing next to you, QR code to QR code, no server. The only social feature permitted. Solves "what are you seeing this weekend?" without creating a social network.

**`posterGenerator`**
Goal: a shareable image of your personal highlights — the offline-generated "my festival lineup" poster that people post on Instagram. Social expression without a server or account.

---

### Food

**Food Finder** (always on)
Goal: at 1am and hungry, you need the nearest vegan option in under 10 seconds. Browse vendors by diet type (vegan, vegetarian, gluten-free, halal), price range, and cuisine. Pre-loaded from `food.json`.

**`foodRatings`**
Goal: let users rate vendors locally. When a friend asks "is the Thai place good?" you have a personal record. No shared database — just your own ratings, stored in `localStorage`.

---

### Web Hub (Root `/`)

**Festival grid + routing**
Goal: entry point to all festivals. A casual user lands here, picks their festival, and is routed into that festival's companion. Everything below `/[festivalId]/` is fully isolated per festival.

**Global Search (`/search`)**
Goal: cross-festival artist lookup. "Is Artist X playing any of these festivals this summer?" One query, all lineups searched simultaneously.

**Global Radar**
Goal: a visual overview of all festivals — dates, artist counts, upcoming. Gives the platform a sense of scale and helps users who are deciding which festival to attend.

---

## What Is Permanently Out of Scope

These categories are not deferral items. They are architectural decisions that will not be revisited:

| Category | Why excluded |
|----------|--------------|
| Accounts / login | Creates data liability. The app is anonymous by design. |
| Social feeds / photo walls | Require live servers and moderation. Break offline mandate. |
| Camera features (AR, QR for non-tactical use) | Hard mandate. No exceptions. |
| Cloud AI | Privacy mandate. Any AI must run on-device. |
| Real-time crowd heatmaps | Require live signal. Fail the Main Stage Test. |
| Advertising / sponsor SDKs | Corrupt the "pure signal" UX. |
| Financial integrations (bank, wallet) | Out of scope for a festival tool. |

---

## The Main Stage Test

Every feature must pass this before shipping:

> Stand at the main stage. 100,000 people around you. No signal bars. Battery at 20%. Direct sunlight. Does this feature still work, and does it still make sense?

If the answer is no, the feature either needs to be redesigned (pre-load the data, remove the network call) or it does not ship.
