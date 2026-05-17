# Sziget Insider 2026 — Feature Backlog

Curated list of ~170 features, ranked S → D tier.
Removed: live streaming (rights/bandwidth), privacy-invasive social tracking, drug-related content.

**Tier key:**
- **S** — Must-have. Core to the app's value. Build first.
- **A** — Strong differentiators. Makes the app feel premium.
- **B** — Solid quality-of-life. Build second.
- **C** — Situational. Build if time allows.
- **D** — Skip. Gimmick, rarely used, or too costly for the return.

**Status key:**
- `[x]` — Already built
- `[ ]` — Not yet built

---

## Schedule & Lineup

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 1 | Full artist lineup browser | S | [x] | |
| 2 | Timeline/grid schedule view | S | [x] | GRID 2.0: 2D Drag, Zoom, Pinned Headers |
| 3 | Clash detection — warns when two saved acts overlap | S | [x] | Glastonbury's most-praised feature |
| 4 | Offline schedule access (no internet needed) | S | [x] | Connectivity dies with 100k people in one field |
| 5 | Push notifications before a saved set starts | S | [ ] | "You have 15 mins before Bicep on Main Stage" |
| 6 | Real-time cancellation / set change alerts | S | [ ] | Critical trust feature |
| 7 | Personal schedule builder — pick your acts | S | [x] | Choose from GRID or LIST |
| 8 | Day-by-day schedule filter | S | [x] | |
| 9 | Stage filter on schedule | S | [x] | Grid is sorted by Stage by default |
| 10 | "Now playing" live indicator | S | [x] | Pulsing ToxicGreen badge on card |
| 11 | "Up next" home screen card | A | [ ] | Coachella's lock screen widget was widely praised |
| 12 | Two-tier favouriting: "Must See" vs "Interested" | A | [ ] | Single most requested Glastonbury missing feature |
| 13 | Share your schedule with friends | A | [x] | Peer-to-Peer 'Squad Link' (QR) |
| 14 | Lock screen widget (iOS Live Activities / Android widget) | A | [ ] | Coachella does this, users love it |
| 15 | Auto-detect time zone and convert stage times | B | [ ] | For international visitors |
| 16 | "I saw this" check-in per set | B | [ ] | Powers post-festival wrap |
| 17 | Reminder snooze ("remind me again in 10 min") | B | [ ] | |
| 18 | Stage-by-stage view (horizontal grid, one column per stage) | A | [ ] | Insomniac grid view was removed and still missed |
| 19 | Set duration indicator (60 min / 90 min / 2 hr) | B | [ ] | Helps planning |
| 20 | Sync schedule across devices (web ↔ Android) | B | [ ] | Both platforms exist — use it |
| 21 | iCal / Google Calendar export | B | [ ] | Underrated utility |
| 22 | Back-to-back set warning ("5 min gap, different stages") | A | [ ] | Nobody does this well |
| 23 | Schedule as exportable/printable list | B | [ ] | Battery-dead backup |
| 24 | Sort artists: headliner → A-Z → by day | B | [x] | Already in DiscoverViewModel |
| 25 | Historical set times from past Sziget years | C | [ ] | Interesting for returning fans |

---

## Artist Discovery

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 26 | Artist bio + photo | S | [x] | ArtistDetailScreen |
| 27 | Genre tags | S | [x] | |
| 28 | Vibe tags | A | [x] | Good differentiator, already built |
| 29 | In-app music preview (Spotify/YouTube embed) | S | [ ] | Most requested feature across all festival apps. Users want to hear artists before deciding |
| 30 | Spotify integration — show artists you already know | S | [ ] | Highest-value discovery feature. Glastonbury, Coachella, R&L all do this |
| 31 | Auto-build a Spotify playlist of your saved acts | S | [ ] | KILLER feature. Users will screenshot and share this |
| 32 | "You might like" AI recommendations based on saved artists | A | [x] | AI flow exists |
| 33 | Browse by mood/energy level | A | [x] | MoodHelper exists |
| 34 | "Hidden gems" — high-quality lesser-known acts | A | [ ] | Brilliant curation play |
| 35 | Artist social media links | B | [x] | ArtistDetailScreen |
| 36 | Genre filter | S | [x] | DiscoverScreen |
| 37 | Search bar with live filtering | S | [x] | |
| 38 | "New to lineup" badge (vs returning acts) | B | [ ] | |
| 39 | "Only on Sziget" — exclusive/debut performances | A | [ ] | Festival-specific editorial |
| 40 | Similar artists crosslink ("if you like X, check Y") | A | [ ] | |
| 41 | Popularity rank indicator (most-saved acts) | B | [ ] | |
| 42 | "Don't miss" editorial picks curated by app team | A | [ ] | Adds personality |
| 43 | Filter: "Show me only acts I haven't heard" | B | [ ] | Pairs with Spotify integration |
| 44 | Browse by country of origin | B | [ ] | |
| 45 | Filter out artists you already know (discovery mode) | B | [ ] | |
| 46 | Artist-curated playlist (what they're listening to) | A | [ ] | Unique editorial angle |
| 47 | Stage debut indicator ("First time on Main Stage") | C | [ ] | |
| 48 | Headliner spotlight cards | B | [ ] | |

---

## Maps & Navigation

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 49 | Interactive festival map | S | [x] | MapScreen exists |
| 50 | Clickable POIs (stages, toilets, water, first aid, food, ATM) | S | [x] | |
| 51 | Offline map (cached, works without signal) | S | [ ] | Critical. Almost no official app does this well |
| 52 | Custom pin — "mark my tent" | S | [ ] | Single most useful campsite feature |
| 53 | Multiple saved pins ("friends' tent", "our spot", "car park") | A | [ ] | |
| 54 | Stage walking time estimate ("~8 min walk") | A | [ ] | Nobody does this. Huge utility |
| 55 | Basic routing: "Get me to Stage X" | A | [ ] | The single most-requested missing feature across ALL festival apps |
| 56 | Category filter on map | A | [x] | stages/food/water/toilets/medical |
| 57 | Search map by name or category | A | [ ] | |
| 58 | Toilet queue indicator (crowdsourced) | A | [ ] | People would tap this constantly |
| 59 | Water point locator | S | [x] | |
| 60 | First aid / medical station pinned | S | [x] | |
| 61 | ATM locator | B | [ ] | |
| 62 | Charging point locator | A | [ ] | Glastonbury/Vodafone tent. Battery is a real festival problem |
| 63 | Accessible route / wheelchair-friendly path | A | [ ] | Underserved, sets you apart |
| 64 | "I'm lost" button → shows nearest exit + first aid | A | [ ] | |
| 65 | Campsite map (separate layer) | B | [ ] | |
| 66 | Parking zone map | B | [ ] | |
| 67 | Shuttle bus stops on map | B | [ ] | |
| 68 | Stage capacity indicator (front vs side entry) | B | [ ] | |
| 69 | Night mode map (OLED high contrast) | A | [ ] | Fits brutalist theme |
| 70 | Map snapshot to share with friends | B | [ ] | |
| 71 | AR navigation overlay (camera → see POI arrows) | C | [ ] | R&L did this first. Impressive but often gimmicky in practice |
| 72 | Meeting point suggestions ("meet at the ferris wheel") | B | [ ] | |

---

## Social & Friends

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 73 | Group schedule — merge yours with friends' | A | [ ] | Glastonbury 2025. Core social loop |
| 74 | Group schedule voting (friends vote on acts) | A | [ ] | Festival Dust — unique, viral feature |
| 75 | "I'm at Stage X" one-tap status update | A | [ ] | Solves the core "where are you?" problem |
| 76 | QR code to instantly add friends in-app | A | [x] | Peer-to-Peer Squad scanning |
| 77 | "Friends going to this set" indicator | A | [ ] | |
| 78 | Share artist/set card to WhatsApp/Instagram | A | [ ] | Viral growth loop |
| 79 | Share your schedule as an image | A | [ ] | |
| 80 | Group meeting point broadcast | A | [ ] | "Meet at entrance in 10 min" |
| 81 | Split costs tracker | B | [ ] | Unique, practical |
| 82 | Lost & found board | B | [ ] | Practical, underserved |
| 83 | Post-festival friend activity recap | B | [ ] | "You and Tom saw 12 acts together" |
| 84 | In-app group chat | C | [ ] | Complex to build, high moderation risk |
| 85 | Community message board per stage | D | [ ] | Moderation nightmare |
| 86 | "Who's going?" public attendee directory | D | [ ] | Privacy risk |

---

## Gamification & Passport

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 87 | Stamp collection passport | A | [x] | PassportScreen exists |
| 88 | XP / rank system | A | [x] | |
| 89 | Post-festival "My Highlights" wrap (Spotify Wrapped-style) | S | [ ] | Glastonbury 2025. Incredibly shareable. Acts seen, genres explored, stages visited |
| 90 | Daily challenges ("see 3 acts you've never heard before") | A | [ ] | Drives exploration |
| 91 | Achievement badges ("Night Owl", "Stage Hopper", "Loyal Fan") | A | [ ] | |
| 92 | Steps walked leaderboard with friends | A | [ ] | Glastonbury 2025. Surprisingly sticky |
| 93 | Stages visited tracker | B | [ ] | |
| 94 | Streak reward ("saw an act every day of the festival") | B | [ ] | |
| 95 | "Acts seen" counter | B | [ ] | |
| 96 | Genre diversity score ("You explored 7 genres!") | B | [ ] | |
| 97 | Festival bingo card | B | [ ] | |
| 98 | Post-festival wrap | B | [ ] | |
| 99 | "Festival veteran" badge for returning years | A | [ ] | Builds multi-year loyalty |
| 100 | Year-over-year comparison ("In 2025 you saw 8 acts, this year: 12") | A | [ ] | For returning attendees |
| 101 | "Acts you almost missed" post-festival recap | B | [ ] | Clever content |
| 102 | Leaderboard (most acts seen among friends) | B | [ ] | |
| 103 | Festival countdown (home screen, pre-event) | B | [ ] | Pre-festival engagement |
| 104 | Scavenger hunt tied to real-world locations | C | [ ] | Coachella does this. Complex to execute |
| 105 | Easter egg hunt (hidden stamps in app UI) | C | [ ] | |
| 106 | NFT rewards / digital collectibles | D | [ ] | Coachella tried this. Skip |

---

## Survival Tools

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 107 | Currency converter HUF ↔ EUR/USD | A | [x] | ToolsScreen |
| 108 | SOS beacon / flashlight | A | [x] | |
| 109 | Emergency contacts list | A | [x] | |
| 110 | Weather forecast (hourly, festival-specific) | S | [ ] | Nothing ruins a festival like unexpected rain |
| 111 | Rain alert push notification | S | [ ] | |
| 112 | Hungarian phrase guide / translator | A | [ ] | Sziget-specific. Huge for international visitors |
| 113 | Local emergency numbers (police, ambulance, Hungarian) | S | [ ] | |
| 114 | Dehydration reminder ("drink water every hour") | B | [ ] | |
| 115 | Battery saver mode (reduces app drain) | A | [ ] | Critical at festivals. Tomorrowland got 1-star reviews for killing batteries |
| 116 | Low battery alert → auto-save offline essentials | A | [ ] | |
| 117 | Nearest hospital / medical clinic outside festival | B | [ ] | |
| 118 | Taxi / Bolt / Uber fare estimator to/from venue | B | [ ] | |
| 119 | Bus/train timetable from Budapest | B | [ ] | |
| 120 | Phone signal map (which areas have worst coverage) | A | [ ] | Unique, practical, nobody else does this |
| 121 | Packing list | B | [x] | Web version exists |
| 122 | Campsite setup checklist | B | [ ] | |
| 123 | Lost wristband procedure | B | [ ] | |
| 124 | Budapest tourist tips | C | [ ] | |
| 125 | Noise level / hearing damage indicator | C | [ ] | Unique health angle |
| 126 | Sunscreen reminder | D | [ ] | Too nanny-ish |
| 127 | Alcohol unit tracker | D | [ ] | Liability risk |

---

## Food & Drink

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 128 | Food vendor browser with map pins | A | [x] | FoodScreen + FoodRepository |
| 129 | Food vendor menu (what they serve + prices) | A | [ ] | |
| 130 | Dietary filter (vegan, halal, gluten-free, kosher) | S | [ ] | Massive audience, increasingly expected |
| 131 | Queue length crowdsourcing | A | [ ] | Tap to report: "15 min wait at Burger van" |
| 132 | "Open now" filter (late night options) | B | [ ] | |
| 133 | Price range filter | B | [ ] | |
| 134 | Food vendor search by cuisine type | B | [ ] | |
| 135 | Vendor photos | B | [ ] | Drives appetite |
| 136 | Favourite vendors saved | B | [ ] | |
| 137 | Food vendor ratings / reviews | B | [ ] | |
| 138 | Water point map | S | [x] | |
| 139 | Pre-order food (skip queue) | A | [ ] | Huge convenience. Requires vendor integration |
| 140 | Cashless top-up in-app (if Sziget goes RFID cashless) | A | [ ] | Tomorrowland/Bonnaroo model |

---

## Accessibility & Inclusion

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 141 | Accessibility map (wheelchair routes, accessible toilets) | A | [ ] | Underserved, sets you apart |
| 142 | Font size / contrast accessibility settings | A | [x] | Full scaling support for nav/cards |
| 143 | Screen reader support (proper a11y labels) | A | [ ] | |
| 144 | Sign language interpretation schedule | B | [ ] | |
| 145 | Sensory-friendly / low-stimulation area locations | B | [ ] | |
| 146 | Accessible entry gate map | B | [ ] | |

---

## Technical & Platform Polish

| # | Feature | Tier | Status | Notes |
|---|---------|------|--------|-------|
| 147 | Full offline mode (everything works without internet) | S | [ ] | The #1 differentiator vs official apps which all fail here |
| 148 | Background data sync when signal returns | A | [ ] | |
| 149 | Dark/OLED-optimized theme | A | [x] | |
| 150 | Battery usage optimization (no background GPS drain) | S | [ ] | Tomorrowland got 1-star reviews for this |
| 151 | Fast cold-start (under 2 seconds) | A | [ ] | |
| 152 | Android home screen widget | A | [ ] | |
| 153 | Haptic feedback | A | [x] | HapticManager built |
| 154 | Crash reporting / stability | A | [ ] | Firebase Crashlytics |
| 155 | App size under 30MB | B | [ ] | Users hesitate to download large apps |
| 156 | Predictive pre-fetch (downloads tomorrow's data tonight) | B | [ ] | |
| 157 | Push notification opt-in per category (not a spam blast) | B | [ ] | |
| 158 | Onboarding flow with genre/vibe quiz | A | [ ] | Personalizes the app from minute one |
| 159 | Multi-language support (English + Hungarian minimum) | A | [ ] | Sziget is heavily international |
| 160 | Cross-platform sync (web ↔ Android share favourites) | A | [ ] | Both platforms exist — exploit it |
| 161 | Data export (your festival data, GDPR-compliant) | B | [ ] | |
| 162 | Adaptive icon (Android) | B | [ ] | |
| 163 | Animated transitions that feel premium | B | [x] | Partially built |
| 164 | Year-round mode: lineup announcements, news pre-festival | B | [ ] | Keeps users in the app between festivals |
| 165 | Push notifications for surprise sets / special guests | S | [ ] | Highest-value notification type |

---

## Explicitly Out of Scope

These were removed from consideration:

| Feature | Why Out |
|---------|---------|
| Live streaming performances | Rights and bandwidth issues |
| On-demand set replays | Same |
| In-app festival radio stream | Would require licensing |
| Drug harm reduction info | Not aligned with app's identity |
| Live friend location sharing (GPS) | Privacy — not the app's direction |
| "Who's nearby" proximity features | Privacy risk |
| Public attendee directory | Privacy risk |
| NFT rewards / digital collectibles | Coachella tried it, skip |
| Alcohol unit tracker | Liability |
| Community social threads | Moderation nightmare |

---

## The 10 Features That Would Make This App Famous

If only 10 new things get built, build these:

1. **Spotify playlist auto-builder** (#31) — most shareable feature in the list. Users will screenshot and post it
2. **Post-festival "My Highlights" wrap** (#89) — shareable, sticky, viral. Acts seen, genres, stages
3. **True offline mode** (#147) — no official festival app does this properly. Instant credibility
4. **In-app music preview** (#29) — hear artists before committing to their set
5. **Clash detection** (#3) — universally praised, often missing
6. **Weather forecast + rain alerts** (#110/#111) — saves the day, literally
7. **"Mark my tent" custom map pin** (#52) — immediate practical value
8. **Basic "get me to Stage X" routing** (#55) — most-requested missing feature across all festival apps
9. **Dietary filter on food** (#130) — large, underserved audience
10. **Post-festival highlights wrap** already counted — swap for **Android home screen widget** (#152) — "who's on now" on your lock screen
