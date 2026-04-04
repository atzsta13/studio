# 🌐 Phase 5: The Festival Insider Hub (Meta Portal)

## 🌌 Vision
To transform the platform from a collection of apps into the **"Global Gateway for Festival Intelligence."** The Hub acts as the top-level aggregator for every festival powered by the engine.

---

### 1. The Dynamic Entry Point (`/`)
The root path is a premium dashboard designed for "Festival Shoppers."
- **Visual Radar**: High-impact cards for every active festival.
- **Global Search**: Search 1,000+ artists across all festivals simultaneously.
- **Vibe Matcher**: AI-driven "Which festival matches my Spotify DNA?" quiz.

### 2. Global Artist Discovery
**The "Follow Your Artist" feature**:
- Clicking an artist (e.g., "Dimension") in the Hub shows a global timeline:
    - *Dimension @ Nova Rock (June 12)*
    - *Dimension @ Sziget (August 10)*
- Link directly into the specific festival sub-app for tactical details.

### 3. Shared State & Passport
**The "Meta Insider" Rank**:
- User data (favorites, unlocked stamps) is stored in `localStorage` prefixed by festival ID.
- The Hub aggregates these prefixes to show a **"Total XP"** across the entire summer circuit.
- **Achievements**: "Summer Legend" (Attend 3+ different festivals in one season).

---

## 🛠️ Roadmap to Completion
1.  [x] **Monolithic Routing Refactor**: Move apps to `/[festivalId]`.
2.  [x] **Dynamic Config Engine**: `InsiderProvider` supports per-festival themes.
3.  [x] **Cross-Festival Sync**: `public/data/` architecture implemented.
4.  [ ] **Global Search Component**: Implement a search engine that iterates over all `lineup.json` files in `public/data/*/`.
5.  [ ] **Spotify Matchmaker**: Port the Vibe Quiz logic to work at a global level (output = Festival Recommendation).
6.  [ ] **Interactive Map**: A 3D or SVG globe showing geo-markers for all active festivals.
