# ISSUES.md — Known broken behavior

What's genuinely **broken** (fails at runtime), as opposed to unfinished backlog work (that lives in `TASKS.md`). Audited 2026-07-10 against the code on `main`.

---

## 🔴 P0 — AI Scout model download is dead for real users

**Where:** `ui/discover/DiscoverScreen.kt:247,255-257`, `data/repository/LocalScoutRepository.kt:53,70,150`

The "Download AI Model" button is shown to every user (`canDownload = config.productionUrl != null`, and all configs set `productionUrl`). Tapping it downloads from:

```
https://atzsta13.github.io/studio/<festival>/ai/gemma4-2b-android.bin
```

That URL **404s**:
- There is **no `public/ai/` directory** and no `.bin` model in the repo — nothing is hosted there.
- GitHub Pages has a **100 MB per-file limit**; the model is ~1.2 GB, so it can never live there.

**Consequence:** the download always fails → `llmInference` stays `null` → every Scout call returns `"AI Scout is not ready yet."` (`LocalScoutRepository.kt:150`). This kills the **Location Scout** too — it feeds the same model. The only working path is `onScanLocal` → `adb push` to `/data/local/tmp/llm/gemma4-2b-android.bin`, which is developer-only (USB debugging + manual push).

**This is a decision, not a one-line fix. Pick one:**
1. Host the model as a **GitHub Releases asset** (2 GB limit — feasible) or a real CDN, and update the URL in `DiscoverScreen.kt`.
2. **Hide the download button**; make the Scout an adb-only power-user feature (keep `onScanLocal`).
3. **Cut** the on-device AI Scout entirely.

Until then, a prominent button is wired to always fail — worse than not shipping it.

---

## 🟠 P1 — Location Scout picks the wrong stage

**Where:** `ui/discover/DiscoverViewModel.kt` → `findNearestStage()`

Maps GPS → the map's 0–100 coordinate space with **hardcoded magic numbers** (`deltaLng * 5000`, `deltaLat * 7400`) and a ">~10 km ⇒ pretend you're at (45,50)" fallback. It won't crash, but:
- Even with a working model, "nearest stage" may be **wrong** — the transform isn't calibrated to any real venue.
- Returns nothing if a festival's `poi.json` stages lack `mapCoords`.

**Fix:** compute real great-circle distance from actual stage lat/lng (add lat/lng to stage POIs) instead of the normalized-map heuristic. Gated behind P0 anyway (no model = no output).

---

## 🟡 Not broken — unfinished (see `TASKS.md` P3 — Android)

These *work*; they're just incomplete. Listed here only so they aren't mistaken for breakage:
- `applicationId` still `com.example.festivalinsider` — blocks Play Store release.
- Zero instrumented UI tests; `ArtistViewModel` / `ToolsViewModel` untested.
- No accessibility / `contentDescription` pass.

---

## Not broken (verified working)
Lineup, timetable, tools (incl. new hydration + feedback cards), map, and offline behavior build and run green. Android `assembleDebug` + `testDebugUnitTest` pass; web typecheck + lint + 190 tests pass.
