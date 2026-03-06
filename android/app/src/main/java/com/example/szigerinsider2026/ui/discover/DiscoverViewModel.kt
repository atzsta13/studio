package com.example.szigerinsider2026.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DiscoverViewModel(private val repository: LineupRepository) : ViewModel() {

    private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())
    private val _sortMode = MutableStateFlow("headliners") // "headliners" | "az"
    private val _selectedDay = MutableStateFlow<String?>(null)
    private val _selectedGenre = MutableStateFlow<String?>(null)
    private val _selectedVibe = MutableStateFlow<String?>(null)
    private val _isLoading = MutableStateFlow(true)

    val sortMode = _sortMode.asStateFlow()
    val selectedDay = _selectedDay.asStateFlow()
    val selectedGenre = _selectedGenre.asStateFlow()
    val selectedVibe = _selectedVibe.asStateFlow()
    val isLoading = _isLoading.asStateFlow()

    private val dayOrder = listOf("Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday")

    val availableDays: StateFlow<List<String>> = _allArtists
        .map { artists ->
            artists.mapNotNull { it.day }.distinct()
                .sortedBy { dayOrder.indexOf(it).let { i -> if (i == -1) 99 else i } }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val availableGenres: StateFlow<List<String>> = _allArtists
        .map { artists ->
            artists.flatMap { it.genres }.filter { it != "MUSIC" }.distinct().sorted()
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val availableVibes: StateFlow<List<String>> = _allArtists
        .map { artists ->
            artists.flatMap { it.vibes }.distinct().sorted()
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredArtists: StateFlow<List<Artist>> = combine(
        _allArtists, _sortMode, _selectedDay, _selectedGenre, _selectedVibe
    ) { artists, sort, day, genre, vibe ->
        var result = artists
        day?.let { d -> result = result.filter { it.day?.equals(d, ignoreCase = true) == true } }
        genre?.let { g -> result = result.filter { it.genres.any { gen -> gen.equals(g, ignoreCase = true) } } }
        vibe?.let { v -> result = result.filter { it.vibes.any { vi -> vi.equals(v, ignoreCase = true) } } }
        when (sort) {
            "headliners" -> result.sortedWith(compareByDescending<Artist> { it.isHeadliner }.thenBy { it.artist })
            "az" -> result.sortedBy { it.artist }
            else -> result
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init { loadArtists() }

    private fun loadArtists() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _allArtists.value = repository.getLineup()
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun setSortMode(mode: String) { _sortMode.value = mode }
    fun selectDay(day: String?) { _selectedDay.value = day }
    fun selectGenre(genre: String?) { _selectedGenre.value = genre }
    fun selectVibe(vibe: String?) { _selectedVibe.value = vibe }
}
