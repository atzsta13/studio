# Sziget Insider 2026 — Phase 3: Agent Manifest

Atomic tasks for parallel agent execution. Each block is self-contained.

**GLOBAL RULES (all agents):**
1. **NO `./gradlew`** — Do not run any build commands
2. **Neon Brutalism style** — `OLEDBlack` background, `AcidYellow`/`PrimaryMagenta`/`CyanPulse` accents, `FontWeight.Black`, italic headlines
3. **Haptics on all interactive elements** — `rememberHapticManager()` + appropriate tap type
4. **No Hilt** — Manual `ViewModelProvider.Factory` pattern throughout
5. **Room changes** — Increment `@Database(version = ...)` in `AppDatabase.kt` when modifying entities; `fallbackToDestructiveMigration()` is already set

---

## 🟥 AGENT A — Map Coordinate Fix + Hydration Enhancement
**Scope:** `ui/map/MapScreen.kt` only

**Task 1 — Fix pin coordinate scaling:**
The current code uses `offset(x = (pin.coords.x / 100 * 1000).dp)` which places pins far off-screen.

Replace the map area pin rendering with `BoxWithConstraints` to get real layout dimensions:
```kotlin
BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
    val w = maxWidth
    val h = maxHeight
    pins.forEach { pin ->
        Box(
            modifier = Modifier
                .offset(
                    x = (pin.coords.x / 100f) * w - 20.dp,
                    y = (pin.coords.y / 100f) * h - 20.dp
                )
                // ... rest unchanged
        )
    }
}
```

**Task 2 — Hydration mode pulse animation:**
When `hydrationMode == true`, water station pins should pulse with a cyan glow:
- Use `rememberInfiniteTransition()` with `animateFloat` on alpha (0.4f → 1f, 800ms, `RepeatMode.Reverse`)
- Apply animated alpha only to pins where `pin.type == "water"` and hydration mode is active
- All non-water pins: `alpha = if (hydrationMode) 0.2f else 1f` (use `animateFloatAsState`)

**Task 3 — Nearest Water label:**
Below the category chips, when hydration mode is active, show:
```
NEAREST WATER POINT
[name of POI with lowest distance from center (50,50)]
~[distance] steps away
```
Distance calculation: `sqrt((x-50)^2 + (y-50)^2)` — abstract, no GPS needed.
Use `remember(filteredPois, activeCategory)` to compute this.

---

## 🟨 AGENT B — Vibe DNA Quiz
**Scope:** Create `ui/quiz/VibeQuizScreen.kt`, `ui/quiz/VibeQuizViewModel.kt`, `ui/quiz/VibeResultScreen.kt`. Modify `ui/navigation/Navigation.kt`, `ui/home/HomeScreen.kt`, `ui/discover/DiscoverScreen.kt`.

**VibeQuizViewModel.kt:**
```kotlin
class VibeQuizViewModel(private val repo: LineupRepository) : ViewModel() {
    var step by mutableIntStateOf(0)
    var energy by mutableStateOf("")        // "CHILL" | "BALANCED" | "UNHINGED"
    var genres by mutableStateOf(setOf<String>())   // up to 2
    var crowdVibe by mutableStateOf("")     // "DANCE FLOOR" | "MOSH PIT" | "FESTIVAL FIELD" | "INTIMATE"
    var moodTag by mutableStateOf("")       // "EUPHORIC" | "DARK" | "NOSTALGIC" | "FRESH" | "HARD"
    var wildcards by mutableStateOf(false)

    val results = MutableStateFlow<List<Artist>>(emptyList())

    // Genre → vibe hint mapping for scoring
    private val genreVibeHints = mapOf(
        "TECHNO" to listOf("Dance", "Hard", "Rave"),
        "ELECTRONIC" to listOf("Dance", "Flow"),
        "ROCK" to listOf("High Energy", "Anthemic"),
        "HIP-HOP" to listOf("Party", "Anthemic"),
        "INDIE" to listOf("Feel-good", "Nostalgic"),
        "POP" to listOf("Sing-along", "Feel-good"),
        "METAL" to listOf("Hard", "High Energy"),
        "AMBIENT" to listOf("Chill", "Flow"),
        "JAZZ" to listOf("Chill", "Flow")
    )

    fun computeResults(allArtists: List<Artist>) {
        val targetVibes = buildList {
            when (energy) {
                "CHILL" -> add("Chill")
                "UNHINGED" -> addAll(listOf("Hard", "Rave", "High Energy"))
                else -> addAll(listOf("Dance", "Feel-good"))
            }
            when (moodTag) {
                "EUPHORIC" -> addAll(listOf("Feel-good", "Anthemic", "Sing-along"))
                "DARK" -> addAll(listOf("Hard", "Rave"))
                "NOSTALGIC" -> add("Nostalgic")
                "FRESH" -> addAll(listOf("Flow", "Dance"))
                "HARD" -> addAll(listOf("Hard", "High Energy"))
            }
        }.toSet()

        val scored = allArtists.map { artist ->
            val genreScore = artist.genres.count { g ->
                genres.any { selected -> g.contains(selected, ignoreCase = true) }
            } * 2
            val vibeScore = artist.vibes.count { v -> targetVibes.any { t -> v.equals(t, ignoreCase = true) } }
            val headlinerBonus = if (artist.isHeadliner && !wildcards) 1 else 0
            val noise = if (wildcards) (0..100).random() / 100f else 0f
            Pair(artist, genreScore + vibeScore + headlinerBonus + noise)
        }

        val sorted = scored.sortedByDescending { it.second }
        val top = sorted.filter { it.second > 0 }.take(8).map { it.first }
        results.value = if (top.size >= 4) top else sorted.take(4).map { it.first }
    }
}
```

**VibeQuizScreen.kt:**
- Full-screen `OLEDBlack` background
- Step indicator at top: 5 dots, active = `AcidYellow`, inactive = `CardBackground`
- Each step: large italic headline question + 2–4 choice chips in a `FlowRow` (or `LazyRow`)
- Selected chip: `AcidYellow` bg + black text. Unselected: `CardBackground` + white text
- "NEXT →" button at bottom (disabled until selection made)
- On step 5 completion: call `viewModel.computeResults(allArtists)` then navigate to `vibe_results`
- Back button on steps 2–5 decrements step

**VibeResultScreen.kt:**
- Receives results from ViewModel
- Header: `"YOUR SOUND / UNLOCKED"` in massive italic type
- Below: `LazyColumn` of artist cards (reuse `ArtistCard` composable)
- FAB: `"SAVE ALL AS FAVORITES"` — calls `artistViewModel.toggleFavorite()` for each result
- Small "RETAKE QUIZ" text button at bottom

**Navigation additions:**
- Add `composable("vibe_quiz") { VibeQuizScreen(navController) }` — hide bottom bar
- Add `composable("vibe_results") { VibeResultScreen(navController) }` — hide bottom bar

**Entry points:**
- `HomeScreen`: Add a `"FIND YOUR SOUND →"` card, navigates to `vibe_quiz`
- `DiscoverScreen`: Add a DNA icon button, navigates to `vibe_quiz`

---

## 🟩 AGENT C — Country Explorer + "More Like This"
**Scope:** Create `ui/discover/CountryExplorerSheet.kt`. Modify `ui/discover/DiscoverViewModel.kt`, `ui/discover/DiscoverScreen.kt`, `ui/artist/ArtistDetailScreen.kt`.

**Task 1 — CountryExplorerSheet.kt:**
A `ModalBottomSheet` composable that accepts `allArtists: List<Artist>` and `onCountrySelected: (String?) -> Unit`.

Content:
- `LazyColumn` of country rows, sorted descending by artist count
- Flag emoji support
- Tapping a row: calls `onCountrySelected(countryCode)`, dismisses sheet

**Task 2 — DiscoverViewModel changes:**
Add `var countryFilter by mutableStateOf<String?>(null)` to the filter logic.

**Task 3 — DiscoverScreen.kt changes:**
Add a globe `IconButton` next to search. Show active filter chip when selected.

**Task 4 — "More Like This" in ArtistDetailScreen.kt:**
At the bottom, add a row of compact artist cards based on shared genres/vibes.

---

## 🟦 AGENT D — Serendipity Mode + 2025→2026 Diff
**Scope:** Create `ui/discover/SerendipityScreen.kt`, `data/repository/LineupDiffRepository.kt`, `ui/home/LineupDiffSheet.kt`. Modify `ui/discover/DiscoverScreen.kt`, `ui/discover/DiscoverViewModel.kt`, `ui/home/HomeScreen.kt`, `ui/navigation/Navigation.kt`.

**Task 1 — SerendipityScreen.kt:**
Full-screen overlay for random artist discovery. 
- "SPINNING" animation (1.5s)
- "REVEALED" state with artist card spring animation

**Task 2 — LineupDiffRepository.kt:**
Compare `lineup.json` and `lineup_2025.json` to find New, Returning, and Dropped artists.

**Task 3 — LineupDiffSheet.kt:**
Modal bottom sheet with tabs for NEW / RETURNING / VIBE SHIFT.

**Task 4 — HomeScreen.kt addition:**
Add a `"NEW THIS YEAR"` teaser card that opens the diff sheet.

---

## 🔶 AGENT E — Survival Guide
**Scope:** Create `ui/tools/SurvivalGuideScreen.kt`, `data/content/SurvivalGuideContent.kt`. Modify `ui/tools/ToolsScreen.kt`, `ui/navigation/Navigation.kt`.

**Task 1 — SurvivalGuideScreen.kt:**
- `LazyColumn` with collapsible `ExpansionCard` per section (Transport, Money, Safety, Camping, Phrases).
- Phrase section has clipboard copy integration.

---

## 🔷 AGENT F — Vibe Backfill Script (Web/Node.js)
**Scope:** Create `scripts/backfill-vibes.mjs`. Modify `src/data/lineup.json` + `android/app/src/main/assets/lineup.json`.
- Script to auto-assign vibe tags based on artist genres to ensure 100% coverage.
