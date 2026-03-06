package com.example.szigerinsider2026.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DiscoverViewModel(private val repository: LineupRepository) : ViewModel() {

    private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())
    private val _selectedVibe = MutableStateFlow<String?>(null)
    private val _isLoading = MutableStateFlow(true)
    
    val selectedVibe = _selectedVibe.asStateFlow()
    val isLoading = _isLoading.asStateFlow()

    val availableVibes: StateFlow<List<String>> = _allArtists
        .map { artists -> 
            artists.flatMap { it.vibes }.distinct().sorted().map { it.uppercase() }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredArtists: StateFlow<List<Artist>> = combine(_allArtists, _selectedVibe) { artists, vibe ->
        if (vibe == null) {
            artists
        } else {
            artists.filter { it.vibes.any { v -> v.equals(vibe, ignoreCase = true) } }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadArtists()
    }

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

    fun selectVibe(vibe: String?) {
        _selectedVibe.value = vibe
    }
}
