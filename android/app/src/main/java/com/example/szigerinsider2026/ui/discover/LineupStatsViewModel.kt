package com.example.szigerinsider2026.ui.discover

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.repository.ILineupRepository
import com.example.szigerinsider2026.data.repository.LineupRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LineupStatsViewModel(private val repo: ILineupRepository) : ViewModel() {

    private val _genreStats = MutableStateFlow<List<Pair<String, Int>>>(emptyList())
    val genreStats: StateFlow<List<Pair<String, Int>>> = _genreStats.asStateFlow()

    private val _vibeStats = MutableStateFlow<List<Pair<String, Int>>>(emptyList())
    val vibeStats: StateFlow<List<Pair<String, Int>>> = _vibeStats.asStateFlow()

    private val _totalArtists = MutableStateFlow(0)
    val totalArtists: StateFlow<Int> = _totalArtists.asStateFlow()

    // Derived: genre → set of country codes (for "most diverse" stat)
    private val _countryGenreMap = MutableStateFlow<Map<String, Set<String>>>(emptyMap())
    val countryGenreMap: StateFlow<Map<String, Set<String>>> = _countryGenreMap.asStateFlow()

    init {
        viewModelScope.launch {
            val artists = repo.getLineup()
            _totalArtists.value = artists.size

            val genreCount = mutableMapOf<String, Int>()
            val vibeCount = mutableMapOf<String, Int>()
            // country → set of genres represented
            val countryToGenres = mutableMapOf<String, MutableSet<String>>()

            for (artist in artists) {
                val filteredGenres = artist.genres.filter { it.uppercase() != "MUSIC" }
                for (genre in filteredGenres) {
                    genreCount[genre] = (genreCount[genre] ?: 0) + 1
                }
                for (vibe in artist.vibes) {
                    vibeCount[vibe] = (vibeCount[vibe] ?: 0) + 1
                }
                val country = artist.countryCode
                if (country != null && filteredGenres.isNotEmpty()) {
                    countryToGenres.getOrPut(country) { mutableSetOf() }.addAll(filteredGenres)
                }
            }

            _genreStats.value = genreCount.entries
                .sortedByDescending { it.value }
                .map { it.key to it.value }

            _vibeStats.value = vibeCount.entries
                .sortedByDescending { it.value }
                .map { it.key to it.value }

            _countryGenreMap.value = countryToGenres
        }
    }

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return LineupStatsViewModel(LineupRepository(context)) as T
        }
    }
}
