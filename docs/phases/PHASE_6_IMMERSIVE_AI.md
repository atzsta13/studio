# 🔮 Phase 6: Immersive AI (Gemma 4 Multimodal)

## 🌌 Vision
To transform the Festival Insider from a "Search Tool" into a **"Sensory Companion."** Leveraging Gemma 4 E2B's native any-to-any multimodality, the app will now perceive the festival environment through audio and vision, providing elite intelligence without needing a data connection.

---

### 1. Acoustic Vibe Scout (Audio-to-Text)
**The Problem**: Users walk past a stage, like the music, but don't know the artist or the specific sub-genre.
**The Gemma 4 Solution**:
- **Native Audio Conformer**: The app listens to a 5-second ambient clip.
- **Offline Inference**: Gemma 4 identifies the "Acoustic Fingerprint" (e.g., *Aggressive Industrial Techno, 145 BPM*).
- **RAG Matching**: The engine compares this to the local `lineup.json` and current `timeSlot` to confirm: *"This is Svetec at the Colosseum. Your Spotify DNA suggests a 94% Vibe Match."*

### 2. Tactical Vision (Image-to-JSON)
**The Problem**: GPS is notoriously unreliable in dense festival crowds or under metal stage structures.
**The Gemma 4 Solution**:
- **Spatial Object Detection**: User points the camera at a physical signpost or landmark.
- **Native OCR & Reasoning**: Gemma 4 reads the text and identifies the landmark (e.g., *"Entrance H-HÉV"*).
- **Relative Navigation**: It cross-references the `poi.json` to calculate a path: *"You are at the North Gate. Turn 45° Left for the Main Stage (400m)."*

### 3. Infinite Context Itinerary (128k Token RAG)
**The Problem**: Large lineups (200+ acts) often result in "hallucinations" or missed connections in smaller models.
**The Gemma 4 Solution**:
- **Full-Festival Injection**: We no longer prune the `lineup.json`. The entire 128k context window is used to hold:
    - Complete Artist Bios (200+ acts)
    - Full Survival Guide (80+ sections)
    - Complete POI Map (50+ points)
- **Outcome**: A "God-Mode" AI Scout that never loses track of a single detail.

---

## 🛠️ Implementation Strategy (2026 Edge)
1.  **Target Model**: `Gemma 4 E2B (quantized 4-bit)`.
2.  **Runtime**: Google AI Edge SDK (LiteRT Generative).
3.  **Hardware**: NPU-acceleration required (Snapdragon 8 Gen 4 / Galaxy S25).
4.  **Fallback**: If NPU is unavailable, fallback to **Gemini Flash 2.0 (Cloud)**.
