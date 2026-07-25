package org.openfestivalhub.ui.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.data.local.UserDao
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.repository.LineupRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalTime
import org.openfestivalhub.ui.utils.parseTime

enum class ScheduleTab { GRID, BY_TIME, MY_LINEUP }
enum class ClashType { HARD, TIGHT }
data class ClashPair(val a: Artist, val b: Artist, val type: ClashType, val gapMinutes: Long)

data class ScheduleUiState(
    val allArtists: List<Artist> = emptyList(),
    val favoriteIds: Set<String> = emptySet(),
    val squadFavoriteIds: Set<String> = emptySet(),
    val selectedDay: String = FestivalConfig.DAYS.firstOrNull() ?: "Wednesday",
    val selectedTimeSlot: String = "daypark",
    val activeTab: ScheduleTab = ScheduleTab.GRID,
    val searchQuery: String = "",
    val isLoading: Boolean = true
)

class ScheduleViewModel(
    private val repository: LineupRepository,
    private val userDao: UserDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScheduleUiState())
    val uiState: StateFlow<ScheduleUiState> = _uiState.asStateFlow()

    val dayArtists: StateFlow<List<Artist>> = _uiState.map { state ->
        val query = state.searchQuery.trim()
        state.allArtists
            .filter { artist ->
                val dayMatch = state.selectedDay == "WEEK" || artist.day?.equals(state.selectedDay, ignoreCase = true) == true
                val slotMatch = if (FestivalConfig.FEATURES.dayparkNightpark) {
                    artist.timeSlot == state.selectedTimeSlot
                } else {
                    true
                }
                val searchMatch = query.isBlank() || artist.artist.contains(query, ignoreCase = true)
                dayMatch && slotMatch && searchMatch && artist.showInSchedule
            }
            .sortedWith(
                compareBy<Artist> { FestivalConfig.DAYS.indexOf(it.day ?: "").let { i -> if (i == -1) 99 else i } }
                    .thenBy(nullsLast()) { parseTime(it.startTime) }
                    .thenBy { it.artist }
            )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favoriteArtists: StateFlow<List<Artist>> = _uiState.map { state ->
        state.allArtists.filter { state.favoriteIds.contains(it.id) }
            .sortedWith(
                compareBy<Artist> { FestivalConfig.DAYS.indexOf(it.day ?: "").let { i -> if (i == -1) 99 else i } }
                    .thenBy(nullsLast()) { parseTime(it.startTime) }
                    .thenBy { it.artist }
            )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val clashes: StateFlow<List<ClashPair>> = favoriteArtists.map { detectClashes(it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            val artists = repository.getLineup()
            _uiState.update { it.copy(allArtists = artists, isLoading = false) }
        }

        viewModelScope.launch {
            userDao.getAllFavorites().collect { favorites ->
                _uiState.update { it.copy(favoriteIds = favorites.map { f -> f.artistId }.toSet()) }
            }
        }
    }

    fun selectDay(day: String) {
        _uiState.update { it.copy(selectedDay = day) }
    }

    fun setTimeSlot(slot: String) {
        _uiState.update { it.copy(selectedTimeSlot = slot) }
    }

    fun setTab(tab: ScheduleTab) {
        _uiState.update { it.copy(activeTab = tab) }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun toggleFavorite(artistId: String) {
        viewModelScope.launch {
            val isFav = _uiState.value.favoriteIds.contains(artistId)
            if (isFav) {
                userDao.removeFavorite(artistId)
            } else {
                userDao.addFavorite(org.openfestivalhub.data.local.FavoriteArtist(artistId, System.currentTimeMillis(), "interested"))
            }
        }
    }

    fun updateSquadFavorites(ids: List<String>) {
        _uiState.update { it.copy(squadFavoriteIds = ids.toSet()) }
    }

    private fun detectClashes(favorites: List<Artist>): List<ClashPair> {
        val pairs = mutableListOf<ClashPair>()
        val byDay = favorites.groupBy { it.day }
        
        byDay.forEach { (_, dayArtists) ->
            val sorted = dayArtists.sortedWith(compareBy(nullsLast()) { parseTime(it.startTime) })
            for (i in 0 until sorted.size - 1) {
                for (j in i + 1 until sorted.size) {
                    val a = sorted[i]
                    val b = sorted[j]
                    val startA = parseTime(a.startTime) ?: continue
                    val endA = parseTime(a.endTime) ?: continue
                    val startB = parseTime(b.startTime) ?: continue
                    val endB = parseTime(b.endTime) ?: continue

                    if (timesOverlap(startA, endA, startB, endB)) {
                        pairs.add(ClashPair(a, b, ClashType.HARD, 0L))
                    } else {
                        // Tight transition check (e.g. < 15 mins gap)
                        val gap = java.time.Duration.between(endA, startB).toMinutes()
                        if (gap in 1..14) {
                            pairs.add(ClashPair(a, b, ClashType.TIGHT, gap))
                        }
                    }
                }
            }
        }
        return pairs
    }

    private fun timesOverlap(s1: LocalTime, e1: LocalTime, s2: LocalTime, e2: LocalTime): Boolean {
        fun toMin(t: LocalTime) = t.hour * 60 + t.minute
        fun endMin(s: LocalTime, e: LocalTime) = toMin(s).let { sm -> toMin(e).let { em -> if (em <= sm) em + 1440 else em } }
        val start1 = toMin(s1); val end1 = endMin(s1, e1)
        val start2 = toMin(s2); val end2 = endMin(s2, e2)
        return start1 < end2 && start2 < end1
    }

    class Factory(private val repo: LineupRepository, private val dao: UserDao) : androidx.lifecycle.ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T = ScheduleViewModel(repo, dao) as T
    }
}
