package com.example.szigerinsider2026.ui.highlights

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.repository.LineupRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class HighlightsSummary(
    val rank: String,
    val xp: Int,
    val favoriteCount: Int,
    val topGenres: List<String>,
    val topVibes: List<String>,
    val stampsCount: Int,
    val favoriteNames: List<String>
)

class HighlightsViewModel(
    private val dao: com.example.szigerinsider2026.data.local.UserDao,
    private val lineupRepo: LineupRepository
) : ViewModel() {

    private val _summary = MutableStateFlow<HighlightsSummary?>(null)
    val summary: StateFlow<HighlightsSummary?> = _summary

    init {
        viewModelScope.launch {
            combine(dao.getAllFavorites(), dao.getUserProgress()) { favorites, progress ->
                val lineup = lineupRepo.getLineup()
                val artistMap = lineup.associateBy { it.id }
                val favArtists = favorites.mapNotNull { artistMap[it.artistId] }

                val genreCount = mutableMapOf<String, Int>()
                val vibeCount = mutableMapOf<String, Int>()
                favArtists.forEach { a ->
                    a.genres.filter { it != "MUSIC" }.forEach { g -> genreCount[g] = (genreCount[g] ?: 0) + 1 }
                    a.vibes.forEach { v -> vibeCount[v] = (vibeCount[v] ?: 0) + 1 }
                }

                HighlightsSummary(
                    rank = progress?.currentRank ?: "Tourist",
                    xp = progress?.legendXp ?: 0,
                    favoriteCount = favorites.size,
                    topGenres = genreCount.entries.sortedByDescending { it.value }.take(4).map { it.key },
                    topVibes = vibeCount.entries.sortedByDescending { it.value }.take(4).map { it.key },
                    stampsCount = progress?.stampsCollected?.size ?: 0,
                    favoriteNames = favArtists.map { it.artist }.take(10)
                )
            }.collect { _summary.value = it }
        }
    }

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            HighlightsViewModel(
                AppDatabase.getDatabase(context).userDao(),
                LineupRepository(context)
            ) as T
    }
}
