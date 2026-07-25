# ISSUES.md — Known broken behavior

What's genuinely **broken** (fails at runtime), as opposed to unfinished backlog work (that lives in `TASKS.md`). Audited 2026-07-10 against the code on `main`.

---

## ✅ P0 — AI Scout model download (FIXED 2026-07-10)
Migrated from manual 1.2GB .bin download to official **ML Kit Prompt API**. Uses system-managed **Gemini Nano** via AICore. No external hosting required.

---

## ✅ P1 — Location Scout accuracy (FIXED 2026-07-10)
Refactored `findNearestStage()` to use real Great-circle distance calculation via `Location.distanceBetween()`. Added GPS coordinates to Sziget 2026 POIs.

---

## 🟡 Not broken — unfinished (see `TASKS.md` P3 — Android)

These *work*; they're just incomplete. Listed here only so they aren't mistaken for breakage:
- `applicationId` still `org.openfestivalhub` — blocks Play Store release.
- Zero instrumented UI tests; `ArtistViewModel` / `ToolsViewModel` untested.
- No accessibility / `contentDescription` pass.

---

## Not broken (verified working)
Lineup, timetable, tools (incl. new hydration + feedback cards), map, and offline behavior build and run green. Android `assembleDebug` + `testDebugUnitTest` pass; web typecheck + lint + 190 tests pass.
