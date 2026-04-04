# 🏝️ Sziget Festival 2026: Intelligence & Data Strategy

## 🎯 Target Audience Personas
Based on stage programming, we serve four primary "Tribes":

1.  **Main Stage Hero**: Follows the big global icons (Pop, Rock, Indie). Values convenience and high-production "Sziget Moments".
2.  **Delta Dweller (EDM)**: Lives for the night. Focuses on the "Triangle of Electronic Music" (Colosseum, Bolt, The Club).
3.  **Szoho Scout**: Creative and urban. Likes Hip-Hop (dropYard), street culture, and "Tomorrow's Headliners" (The Buzz).
4.  **Global Nomad**: Culturally curious. Values World Music (Global Village), acoustic sets (Lightstage), and immersive arts (Magic Mirror, Cirque).

---

## 🗺️ Territory & Stage Mapping
We use these mappings to automatically assign `stage` and `vibes` during data cleanup.

| Territory | Stages | Core Genres | Primary Vibes |
|-----------|--------|-------------|---------------|
| **Main Arena** | Main Stage | Pop, Rock, Hip-Hop | Iconic, High-Energy |
| **Delta District** | Bolt Night Stage, Yettel Colosseum, The Club | Techno, House, Trance, EDM | Hypnotic, Dark, Electronic |
| **Szoho District** | The Buzz, dropYard, The Cypher | Indie, Alternative, Hip-Hop, Bass | Urban, Creative, Edgy |
| **Global Village** | Global Village | World, Folk, Traditional | Organic, Cultural, Diverse |
| **Alternative Core**| Revolut Stage | Alternative, Electronic Live | Experimental, Eclectic |
| **Freedom Zone** | Magic Mirror, Lightstage | Queer, Cabaret, Acoustic | Intimate, Inclusive, Chill |

---

## 🛠️ Data Assignment Logic (Regex/Keywords)
For use in `src/scripts/clean_lineup.js`:

- **Main Stage**: If `isHeadliner` or in `HEADLINERS` list.
- **Yettel Colosseum**: Keywords: `colosseum`, `underground techno`, `pallets`.
- **Bolt Night Stage**: Keywords: `arena`, `party arena`, `edm heaven`, `trance`.
- **The Club**: Keywords: `deep house`, `intimate club`, `late night beats`.
- **dropYard**: Keywords: `hip-hop`, `rap`, `breakdance`, `skate`.
- **Global Village**: Keywords: `world music`, `folk`, `traditional`, `roots`.
- **Magic Mirror**: Keywords: `queer`, `lgbtq`, `cabaret`, `drag`.

---

## 💡 Feature Opportunity: "Tribe Mode"
The "Radar Focus" feature can be evolved into "Tribe Mode". Instead of just filtering by stage, it re-skins the discovery experience:
- **Delta Mode**: Turns the UI dark/neon, focuses on BPM and night-slots.
- **Global Mode**: Highlights world-music discovery and "Off-the-beaten-path" POIs.
