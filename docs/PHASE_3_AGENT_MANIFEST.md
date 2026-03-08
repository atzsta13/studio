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
        "EXPERIMENTAL" to listOf("Flow", "Weird"),
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
- Receives results from ViewModel (shared between quiz and result via `SavedStateHandle` or passed via nav argument as comma-separated IDs)
- Header: `"YOUR SOUND / UNLOCKED"` in massive italic type
- Below: `LazyColumn` of artist cards (reuse `ArtistCard` composable)
- Each card has the artist's shared genre/vibe count shown as `"3 MATCHES"` badge
- FAB: `"SAVE ALL AS FAVORITES"` — calls `artistViewModel.toggleFavorite()` for each result
- Small "RETAKE QUIZ" text button at bottom

**Navigation additions:**
- Add `composable("vibe_quiz") { VibeQuizScreen(navController) }` — hide bottom bar
- Add `composable("vibe_results") { VibeResultScreen(navController) }` — hide bottom bar (add both to `showBottomBar` exclusion list)

**Entry points:**
- `HomeScreen`: Add a `"FIND YOUR SOUND →"` card in the quick nav grid, navigates to `vibe_quiz`
- `DiscoverScreen`: Add a DNA icon button in the collapsing header toolbar, navigates to `vibe_quiz`

---

## 🟩 AGENT C — Country Explorer + "More Like This"
**Scope:** Create `ui/discover/CountryExplorerSheet.kt`. Modify `ui/discover/DiscoverViewModel.kt`, `ui/discover/DiscoverScreen.kt`, `ui/artist/ArtistDetailScreen.kt`.

**Task 1 — CountryExplorerSheet.kt:**
A `ModalBottomSheet` composable that accepts `allArtists: List<Artist>` and `onCountrySelected: (String?) -> Unit`.

Content:
- Header row: `"GLOBAL LINEUP"` title + total country count badge
- Stats: `"21 NATIONS / [top country]: [N] ARTISTS"` — computed from data
- `LazyColumn` of country rows, sorted descending by artist count:
  ```
  [flag emoji]  [COUNTRY NAME]    [N] ARTISTS    →
  ```
- Flag emoji: Map ISO 2-char countryCode to flag using regional indicator Unicode:
  ```kotlin
  fun countryCodeToFlag(code: String): String {
      val offset = 0x1F1E6 - 'A'.code
      return code.uppercase().map { char ->
          String(Character.toChars(char.code + offset))
      }.joinToString("")
  }
  ```
- Tapping a row: calls `onCountrySelected(countryCode)`, dismisses sheet
- "SHOW ALL" button at top-right: calls `onCountrySelected(null)`
- Tapping a row triggers `haptic.mediumTap()`

**Task 2 — DiscoverViewModel changes:**
Add `var countryFilter by mutableStateOf<String?>(null)` to the existing filter state.

In the existing `filteredArtists` derived state, add a country filter step:
```kotlin
.let { list -> if (countryFilter != null) list.filter { it.countryCode == countryFilter } else list }
```

Expose `fun setCountryFilter(code: String?) { countryFilter = code }`.

**Task 3 — DiscoverScreen.kt changes:**
In the collapsing header, add a globe `IconButton` (use `Icons.Default.Public`) next to the existing search/filter elements. Tapping shows `CountryExplorerSheet`.

When `countryFilter != null`, show an active filter chip below the main filter row:
```
🌍 FRANCE  ×
```
Tapping `×` clears the filter.

**Task 4 — "More Like This" in ArtistDetailScreen.kt:**
At the bottom of the screen (after socials section), add a `"MORE LIKE THIS"` section.

Similarity function (add to `ArtistDetailScreen.kt` or extract to util):
```kotlin
fun findSimilar(current: Artist, all: List<Artist>): List<Artist> {
    return all
        .filter { it.id != current.id }
        .map { candidate ->
            val sharedGenres = current.genres.intersect(candidate.genres.toSet()).size
            val sharedVibes = current.vibes.intersect(candidate.vibes.toSet()).size
            Pair(candidate, sharedGenres * 2 + sharedVibes)
        }
        .filter { it.second > 0 }
        .sortedByDescending { it.second }
        .take(5)
        .map { it.first }
}
```

UI: Horizontal `LazyRow` of compact cards (100dp × 120dp) showing:
- Circular cropped artist image (Coil `AsyncImage`)
- Artist name (2 lines max, bold)
- `"N SHARED"` badge in bottom-right corner (tiny, `AcidYellow`)

`ArtistDetailScreen` already loads the lineup via repository — pass it to `findSimilar`.

---

## 🟦 AGENT D — Serendipity Mode + 2025→2026 Diff
**Scope:** Create `ui/discover/SerendipityScreen.kt`, `data/repository/LineupDiffRepository.kt`, `ui/home/LineupDiffSheet.kt`. Modify `ui/discover/DiscoverScreen.kt`, `ui/discover/DiscoverViewModel.kt`, `ui/home/HomeScreen.kt`, `ui/navigation/Navigation.kt`.

**Task 1 — SerendipityScreen.kt:**
Full-screen composable overlay (use `Dialog` with full-screen window) shown when user taps a "spin" FAB on Discover.

States: `SPINNING` → `REVEALED`

`SPINNING` state:
- Concentric spinning rings using `rememberInfiniteTransition()` with different speeds and directions
- "SCANNING LINEUP..." text pulsing
- Duration: 1500ms → then snap to REVEALED

`REVEALED` state:
- Artist card slams in from bottom with `spring(dampingRatio = 0.5f, stiffness = 400f)` animation
- Full artist image (AsyncImage, fillMaxWidth, 240dp height)
- Artist name in massive italic type
- Genres as colored chips
- `"EXPLORE →"` filled button → navigates to `artist/{id}`
- `"SPIN AGAIN"` text button → replays animation with new artist
- `"CLOSE"` top-right `×`

**DiscoverViewModel additions:**
```kotlin
private val _serendipityHistory = mutableSetOf<String>()

fun getRandomUnfavoritedArtist(allArtists: List<Artist>, favoritedIds: Set<String>): Artist {
    val pool = allArtists
        .filter { it.id !in favoritedIds && it.id !in _serendipityHistory }
        .ifEmpty { allArtists.filter { it.id !in favoritedIds } }
        .ifEmpty { allArtists }
    val pick = pool.random()
    _serendipityHistory.add(pick.id)
    return pick
}
```

**DiscoverScreen.kt addition:**
Floating `ExtendedFloatingActionButton` (bottom-right, above bottom nav):
- Icon: dice or shuffle (`Icons.Default.Shuffle`)
- Label: `"SURPRISE ME"`
- Tapping: calls `viewModel.getRandomUnfavoritedArtist(...)`, navigates to `serendipity/{artistId}`

**Navigation:** Add `composable("serendipity/{artistId}")` → `SerendipityScreen`. Hide bottom bar for this route.

**Task 2 — LineupDiffRepository.kt:**
```kotlin
class LineupDiffRepository(private val context: Context) {
    data class LineupDiff(
        val newArtists: List<Artist>,
        val returningArtists: List<Artist>,
        val droppedArtists: List<Artist>,
        val genreShifts: Map<String, Int>  // genre → delta count
    )

    suspend fun computeDiff(): LineupDiff = withContext(Dispatchers.IO) {
        val artists2026 = LineupRepository(context).getArtists()
        val artists2025 = LineupRepository(context).getArtists("lineup_2025.json")

        val names2026 = artists2026.map { it.artist.trim().lowercase() }.toSet()
        val names2025 = artists2025.map { it.artist.trim().lowercase() }.toSet()

        val newArtists = artists2026.filter { it.artist.trim().lowercase() !in names2025 }
        val returning = artists2026.filter { it.artist.trim().lowercase() in names2025 }
        val dropped = artists2025.filter { it.artist.trim().lowercase() !in names2026 }

        // Genre delta: count occurrences in each year, compute diff
        fun genreCount(list: List<Artist>) = list.flatMap { it.genres }.groupingBy { it }.eachCount()
        val g26 = genreCount(artists2026)
        val g25 = genreCount(artists2025)
        val allGenres = (g26.keys + g25.keys).toSet()
        val shifts = allGenres.associateWith { (g26[it] ?: 0) - (g25[it] ?: 0) }
            .filter { it.value != 0 }
            .entries.sortedByDescending { kotlin.math.abs(it.value) }
            .take(6)
            .associate { it.key to it.value }

        LineupDiff(newArtists, returning, dropped, shifts)
    }
}
```

**LineupDiffSheet.kt:**
`ModalBottomSheet` with 3 tabs: `NEW (N)` / `RETURNING (N)` / `VIBE SHIFT`.

- **NEW tab:** `LazyColumn` of new artist cards (compact: image circle 48dp + name + country flag)
- **RETURNING tab:** same layout for returning artists
- **VIBE SHIFT tab:** list of top 6 genre shifts:
  ```
  TECHNO    +4  ████  (green bar)
  ROCK      -2  ██    (red bar)
  ```
  Bar chart is just a `Box` with width proportional to abs(delta), color green/red by sign.

**HomeScreen.kt addition:**
Above or below the headliner section, add a `"NEW THIS YEAR"` card:
- Shows first 4 new artists as a horizontal scroll of tiny chips (flag + name)
- `"SEE ALL CHANGES →"` text button → opens `LineupDiffSheet`
- Load diff in a `LaunchedEffect` using the new repository

---

## ⬜ AGENT E — Enhanced Passport + Survival Guide
**Scope:** Create `ui/passport/ChallengeEngine.kt`, `ui/passport/ChallengeListScreen.kt`, `ui/tools/SurvivalGuideScreen.kt`, `data/content/SurvivalGuideContent.kt`. Modify `ui/passport/PassportScreen.kt`, `ui/passport/PassportViewModel.kt`, `data/local/UserProgress.kt`, `data/local/AppDatabase.kt`, `ui/tools/ToolsScreen.kt`, `ui/navigation/Navigation.kt`.

**Task 1 — ChallengeEngine.kt:**
Pure Kotlin object (no Android dependencies):
```kotlin
data class Challenge(
    val id: String,
    val title: String,
    val description: String,
    val xpReward: Int,
    val icon: String,  // emoji
    val isCompleted: Boolean = false
)

object ChallengeEngine {
    fun evaluate(
        favorites: List<FavoriteArtist>,
        allArtists: List<Artist>,
        completedIds: Set<String>,
        quizCompleted: Boolean
    ): List<Challenge> {
        val favArtists = favorites.mapNotNull { fav -> allArtists.find { it.id == fav.artistId } }
        val favGenres = favArtists.flatMap { it.genres }.toSet()
        val favCountries = favArtists.mapNotNull { it.countryCode }.toSet()
        val favVibeGroups = favArtists.flatMap { it.vibes }
            .groupingBy { it }.eachCount()
        val mustSeeCount = favorites.count { it.mustSee }

        return listOf(
            Challenge("first_fav", "FIRST LOVE", "Favorite any artist", 50, "⭐",
                favorites.isNotEmpty()),
            Challenge("genre_explorer", "GENRE TOURIST", "Favorite artists from 3 genres", 75, "🎸",
                favGenres.size >= 3),
            Challenge("globe_trotter", "GLOBE TROTTER", "Favorite artists from 5 countries", 100, "🌍",
                favCountries.size >= 5),
            Challenge("headliner_fan", "HEADLINE HUNTER", "Favorite all 6 headliners", 150, "👑",
                favArtists.count { it.isHeadliner } >= 6),
            Challenge("vibe_curator", "VIBE CURATOR", "Favorite 3 artists with the same vibe", 75, "🔮",
                favVibeGroups.values.any { it >= 3 }),
            Challenge("must_see", "MUST-SEE MACHINIST", "Mark 5 artists as must-see", 100, "🔥",
                mustSeeCount >= 5),
            Challenge("quiz_done", "DNA DECODED", "Complete the Vibe Quiz", 50, "🧬",
                quizCompleted),
            Challenge("full_week", "FULL WEEK WARRIOR", "1 favorite for every festival day", 200, "📅",
                DAY_ORDER.all { day -> favArtists.any { it.day == day } })
        ).map { it.copy(isCompleted = it.id in completedIds || it.isCompleted) }
    }
}
```
Note: `DAY_ORDER` constant should be defined in this file: `listOf("Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday")`

**UserProgress.kt changes:**
Add field: `val completedChallengeIds: String = ""` (JSON array string like `["first_fav","globe_trotter"]`)
Also add: `val quizCompleted: Boolean = false`
**Increment DB version.**

**UserDao.kt — add queries:**
```kotlin
@Query("UPDATE user_progress SET completedChallengeIds = :ids WHERE id = 1")
suspend fun updateCompletedChallenges(ids: String)

@Query("UPDATE user_progress SET quizCompleted = 1 WHERE id = 1")
suspend fun markQuizCompleted()
```

**PassportViewModel.kt changes:**
- Collect both `userProgress` and `allFavorites` flows
- In a combined `combine()`, call `ChallengeEngine.evaluate(...)`
- When a challenge transitions from incomplete → complete: award XP via `userDao.updateXP(progress.totalXP + challenge.xpReward)` and update `completedChallengeIds`
- Expose `StateFlow<List<Challenge>> challenges`

**PassportScreen.kt changes:**
Add a `TabRow` with 2 tabs: `STAMPS` and `CHALLENGES`.

`CHALLENGES` tab shows `ChallengeListScreen` as an inline composable:
- `LazyColumn` of challenge cards
- Card style: `CardBackground` bg, left border in accent color (`AcidYellow` if complete, `CardBackground` if not)
- Layout: emoji icon (48dp box) + title + description + XP badge
- Completed challenges: show checkmark, full opacity
- Locked challenges: 50% opacity, no checkmark

**Task 2 — SurvivalGuideScreen.kt:**
Import content from `SurvivalGuideContent.kt` — a list of `GuideSection(title, icon, content, items)` data classes.

UI: `LazyColumn` with `ExpansionCard` per section:
- Header: neon icon + bold uppercase title + chevron (rotates on expand, `animateFloatAsState`)
- Body: fades in with `AnimatedVisibility(visible, fadeIn + expandVertically)`
- Each item in the body as a row (bullet `•` + text)

**Hungarian Phrases section special handling:**
Each phrase row has a clipboard icon button. On tap:
```kotlin
val clipboard = LocalClipboardManager.current
clipboard.setText(AnnotatedString(phrase))
haptic.successBurst()
// Show snackbar via SnackbarHostState
```

**SurvivalGuideContent.kt:**
```kotlin
data class GuideSection(
    val id: String,
    val icon: String,   // emoji
    val title: String,
    val items: List<String>
)

val SURVIVAL_SECTIONS = listOf(
    GuideSection("transport", "🚌", "GETTING THERE", listOf(
        "Shuttle buses run from Budapest Keleti station hourly from Aug 6",
        "Boat transfers available from central Budapest piers",
        "Taxi/Uber: ~20 min from city center, pre-book for return",
        "Bike parking available at all festival gates — free"
    )),
    GuideSection("money", "💶", "MONEY & ATMs", listOf(
        "ATMs located near the Main Stage and Colosseum areas",
        "Most vendors accept card but have HUF cash as backup",
        "1 EUR ≈ 400 HUF (check current rate in Tools tab)",
        "Festival wristbands do NOT have cashless payment in 2026",
        "Withdraw cash before entering — ATM queues grow Friday–Saturday"
    )),
    GuideSection("safety", "🏥", "STAYING SAFE", listOf(
        "Medical tent: near the Main Gate and World Music Stage",
        "Lost & Found: Main Gate info point, open 10:00–22:00 daily",
        "Buddy system: set a meeting point with your group on arrival",
        "Security guards speak English — approach any yellow vest",
        "Emergency number in Hungary: 112"
    )),
    GuideSection("camping", "⛺", "CAMPING RULES", listOf(
        "Quiet hours: 06:00–10:00 in all camping zones",
        "No generators, gas stoves, or open fires in camping areas",
        "Charging stations available in the ISLAND CAMP zone (fee applies)",
        "Mark your tent with something unique — zones look identical at 3am",
        "Ground sheets required — the grass gets muddy fast"
    )),
    GuideSection("hungarian", "🇭🇺", "HUNGARIAN PHRASES", listOf(
        "Kérek egy sört • keh-rek egg-y shurt • I'd like a beer",
        "Mennyibe kerül? • men-yee-beh keh-rool • How much does it cost?",
        "Hol a toalett? • hole a toh-ah-let • Where is the toilet?",
        "Köszönöm • kuh-suh-nuhm • Thank you",
        "Segítség! • sheh-geet-shayg • Help!",
        "Jó zenét! • yo zeh-nayt • Good music! (festival toast)",
        "Víz, legyen szíves • veez leh-dyen see-vesh • Water, please",
        "Elvesztem • el-ves-tem • I am lost",
        "Látom a barátaimat • la-tome a ba-ra-ta-ee-mat • I can see my friends",
        "Ez fantasztikus! • ez fan-tas-tee-koosh • This is fantastic!"
    )),
    GuideSection("rules", "📋", "FESTIVAL RULES", listOf(
        "No re-entry after 02:00 — plan your nights accordingly",
        "Wristband required at all times — do not remove",
        "Banned: glass bottles, professional cameras (detachable lens), drones",
        "Allowed: reusable cups, small backpacks, sunscreen (no aerosol)",
        "Pets not permitted anywhere on the island"
    )),
    GuideSection("connectivity", "📶", "CONNECTIVITY", listOf(
        "Free WiFi hotspots near the info points and food areas",
        "Network gets congested Saturday night — download offline maps now",
        "Recommended offline app: Maps.me with Budapest island area cached",
        "Power banks are essential — charging stations have 2hr queues peak days"
    )),
    GuideSection("eco", "♻️", "ECO TIPS", listOf(
        "Bring a reusable cup — vendors give small discount",
        "Water refill stations: cyan tap symbol on island map",
        "Designated recycling bins: blue (plastic), green (glass), grey (general)",
        "Leave No Trace: your campsite should be cleaner than you found it",
        "Festival officially carbon-offset — look for the green certification stamps"
    ))
)
```

**ToolsScreen.kt addition:**
Add a new `ToolCard` before the footer:
```
[♻️ survival icon]  SURVIVAL GUIDE
                    Camping rules, phrases, money tips
                    "84 TIPS FOR ISLAND SURVIVAL"  →
```
Tapping navigates to `guide` route.

**Navigation.kt:** Add `composable("guide") { SurvivalGuideScreen(navController) }`. Add `"guide"` to `showBottomBar` exclusion list.

---

## 🔶 AGENT F — Vibe Backfill Script (Web/Node.js)
**Scope:** Create `scripts/backfill-vibes.mjs`. Modify `src/data/lineup.json` + `android/app/src/main/assets/lineup.json`.

**backfill-vibes.mjs:**
```js
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const GENRE_TO_VIBES = {
  'TECHNO': ['Dance', 'Hard', 'Rave'],
  'ELECTRONIC': ['Dance', 'Flow'],
  'AMBIENT': ['Chill', 'Flow'],
  'METAL': ['Hard', 'High Energy'],
  'ROCK': ['High Energy', 'Anthemic'],
  'INDIE': ['Feel-good', 'Nostalgic'],
  'HIP-HOP': ['Party', 'Anthemic', 'Sing-along'],
  'HIP HOP': ['Party', 'Anthemic', 'Sing-along'],
  'RAP': ['Party', 'Anthemic'],
  'POP': ['Sing-along', 'Feel-good', 'Party'],
  'EXPERIMENTAL': ['Flow', 'Weird'],
  'JAZZ': ['Chill', 'Flow'],
  'DRUM AND BASS': ['Dance', 'Hard', 'High Energy'],
  'DNB': ['Dance', 'Hard', 'High Energy'],
  'HOUSE': ['Dance', 'Feel-good', 'Party'],
  'TRANCE': ['Dance', 'Rave', 'Euphoric'],
  'PUNK': ['Hard', 'High Energy', 'Mosh'],
  'ALTERNATIVE': ['Feel-good', 'Anthemic'],
  'CLASSICAL': ['Chill'],
  'FOLK': ['Feel-good', 'Nostalgic'],
  'WORLD': ['Feel-good', 'Flow'],
  'REGGAE': ['Chill', 'Feel-good'],
  'TRAP': ['Party', 'Hard'],
  'R&B': ['Feel-good', 'Party', 'Sing-along'],
  'SOUL': ['Feel-good', 'Nostalgic', 'Sing-along'],
}

function inferVibes(genres) {
  const vibes = new Set()
  for (const genre of genres) {
    const normalized = genre.toUpperCase().trim()
    for (const [key, tags] of Object.entries(GENRE_TO_VIBES)) {
      if (normalized.includes(key)) {
        tags.forEach(t => vibes.add(t))
      }
    }
  }
  return [...vibes]
}

function backfill(inputPath, outputPath) {
  const artists = JSON.parse(readFileSync(inputPath, 'utf8'))
  let filled = 0
  const updated = artists.map(a => {
    if (!a.vibes || a.vibes.length === 0) {
      const inferred = inferVibes(a.genres || [])
      if (inferred.length > 0) {
        filled++
        return { ...a, vibes: inferred }
      }
    }
    return a
  })
  writeFileSync(outputPath, JSON.stringify(updated, null, 2))
  console.log(`✓ ${inputPath}: filled vibes for ${filled} artists`)
}

const root = join(__dirname, '..')
backfill(join(root, 'src/data/lineup.json'), join(root, 'src/data/lineup.json'))
backfill(
  join(root, 'android/app/src/main/assets/lineup.json'),
  join(root, 'android/app/src/main/assets/lineup.json')
)
```

Run: `node scripts/backfill-vibes.mjs`

After running, verify with: `node -e "const d=JSON.parse(require('fs').readFileSync('src/data/lineup.json')); console.log('empty vibes:', d.filter(a=>!a.vibes?.length).length)"`
