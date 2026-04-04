package com.example.szigerinsider2026.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.model.AiRecommendationResult
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.data.repository.AiRecommendationRepository
import com.example.szigerinsider2026.data.config.FestivalConfig
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DiscoverViewModel(
    private val repository: LineupRepository,
    private val context: Context? = null
) : ViewModel() {

    private val aiRepository = context?.let { AiRecommendationRepository(it) }
    private val localScoutRepository = context?.let { com.example.szigerinsider2026.data.repository.LocalScoutRepository(it) }

    private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())
    
    // Local AI States
    val isLocalAiDownloaded = localScoutRepository?.isModelDownloaded ?: MutableStateFlow(false)
    val downloadProgress = localScoutRepository?.downloadProgress ?: MutableStateFlow(0f)
    
    private val _localAiResponse = MutableStateFlow<String?>(null)
    val localAiResponse = _localAiResponse.asStateFlow()

    private val _isLocalAiLoading = MutableStateFlow(false)
    val isLocalAiLoading = _isLocalAiLoading.asStateFlow()
    private val _sortMode = MutableStateFlow("headliners") // "headliners" | "az"
    private val _selectedDay = MutableStateFlow<String?>(null)
    private val _selectedGenre = MutableStateFlow<String?>(null)
    private val _selectedVibe = MutableStateFlow<String?>(null)
    private val _selectedStage = MutableStateFlow<String?>(null)
    private val _searchQuery = MutableStateFlow("")
    private val _isLoading = MutableStateFlow(true)
    private val _countryFilter = MutableStateFlow<String?>(null)
    private val _selectedYear = MutableStateFlow("2026")
    private val _aiRecommendations = MutableStateFlow<AiRecommendationResult?>(null)
    private val _aiLoading = MutableStateFlow(false)
    private val _spotifyMatchedIds = MutableStateFlow<Set<String>>(emptySet())
    private val _showSpotifyOnly = MutableStateFlow(false)

    val allArtists: StateFlow<List<Artist>> = _allArtists.asStateFlow()
    val sortMode = _sortMode.asStateFlow()
    val selectedDay = _selectedDay.asStateFlow()
    val selectedGenre = _selectedGenre.asStateFlow()
    val selectedVibe = _selectedVibe.asStateFlow()
    val selectedStage = _selectedStage.asStateFlow()
    val searchQuery = _searchQuery.asStateFlow()
    val isLoading = _isLoading.asStateFlow()
    val countryFilter: StateFlow<String?> = _countryFilter.asStateFlow()
    val selectedYear: StateFlow<String> = _selectedYear.asStateFlow()
    val aiRecommendations: StateFlow<AiRecommendationResult?> = _aiRecommendations.asStateFlow()
    val aiLoading: StateFlow<Boolean> = _aiLoading.asStateFlow()
    val spotifyMatchedIds: StateFlow<Set<String>> = _spotifyMatchedIds.asStateFlow()
    val showSpotifyOnly: StateFlow<Boolean> = _showSpotifyOnly.asStateFlow()

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
        combine(_allArtists, _sortMode, _selectedDay) { artists, sort, day -> Triple(artists, sort, day) },
        combine(_selectedGenre, _selectedVibe, _selectedStage) { genre, vibe, stage -> Triple(genre, vibe, stage) },
        combine(_searchQuery, _countryFilter, _spotifyMatchedIds) { query, country, spotify -> Triple(query, country, spotify) },
        _showSpotifyOnly
    ) { (artists, sort, day), (genre, vibe, stage), (query, country, spotify), showOnly ->
        var result = artists
        country?.let { c -> result = result.filter { it.countryCode == c } }
        day?.let { d -> result = result.filter { it.day?.equals(d, ignoreCase = true) == true } }
        genre?.let { g -> result = result.filter { it.genres.any { gen -> gen.equals(g, ignoreCase = true) } } }
        vibe?.let { v -> result = result.filter { it.vibes.any { vi -> vi.equals(v, ignoreCase = true) } } }
        stage?.let { s -> 
            val configFocus = FestivalConfig.current.content?.radarFocuses?.find { it.id == s }
            result = if (configFocus != null) {
                result.filter { artist ->
                    val matchesStage = configFocus.targetStages?.any { artist.stage?.contains(it, ignoreCase = true) == true } == true
                    val matchesGenre = configFocus.targetGenres?.any { g -> artist.genres.any { ag -> ag.contains(g, ignoreCase = true) } } == true
                    matchesStage || matchesGenre
                }
            } else {
                result.filter { it.stage?.equals(s, ignoreCase = true) == true }
            }
        }
        if (query.isNotBlank()) {
            result = result.filter { it.artist.contains(query.trim(), ignoreCase = true) }
        }
        if (showOnly && spotify.isNotEmpty()) {
            result = result.filter { it.spotifyId in spotify }
        }
        when (sort) {
            "headliners" -> result.sortedWith(compareByDescending<Artist> { it.isHeadliner }.thenBy { it.artist })
            "az" -> result.sortedBy { it.artist }
            else -> result
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadArtists()
        if (isLocalAiDownloaded.value) {
            initializeLocalScout()
        }
    }

    fun downloadModel(url: String) {
        viewModelScope.launch {
            val success = localScoutRepository?.downloadModel(url) == true
            if (success) {
                initializeLocalScout()
            }
        }
    }

    fun initializeLocalScout() {
        localScoutRepository?.initializeLlm()
    }

    fun runLocalScout(prompt: String) {
        viewModelScope.launch {
            _isLocalAiLoading.value = true
            _localAiResponse.value = "" // Start with empty string
            localScoutRepository?.getLocalRecommendationsStreaming(prompt, _allArtists.value)
                ?.collect { chunk ->
                    _localAiResponse.value = (_localAiResponse.value ?: "") + chunk
                }
            _isLocalAiLoading.value = false
        }
    }

    fun clearLocalScout() {
        _localAiResponse.value = null
    }

    private fun loadArtists() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _allArtists.value = repository.getLineup(_selectedYear.value)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _allArtists.value = repository.getLineup(_selectedYear.value)
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun setSortMode(mode: String) { _sortMode.value = mode }
    fun selectDay(day: String?) { _selectedDay.value = day }
    fun selectGenre(genre: String?) { _selectedGenre.value = genre }
    fun selectVibe(vibe: String?) { _selectedVibe.value = vibe }
    fun selectStage(stage: String?) { _selectedStage.value = stage }
    fun setSearchQuery(query: String) { _searchQuery.value = query }
    fun setCountryFilter(code: String?) { _countryFilter.value = code }
    fun setYear(year: String) {
        _selectedYear.value = year
        loadArtists()
    }

    fun fetchAiRecommendations(prompt: String) {
        viewModelScope.launch {
            if (aiRepository == null) return@launch
            _aiLoading.value = true
            try {
                val result = aiRepository.getRecommendations(prompt)
                _aiRecommendations.value = result
            } finally {
                _aiLoading.value = false
            }
        }
    }

    fun clearAiRecommendations() {
        _aiRecommendations.value = null
    }

    fun updateSpotifyMatches(matchedIds: Set<String>) {
        _spotifyMatchedIds.value = matchedIds
    }

    fun setShowSpotifyOnly(show: Boolean) {
        _showSpotifyOnly.value = show
    }

    fun clearSpotifyMatches() {
        _spotifyMatchedIds.value = emptySet()
        _showSpotifyOnly.value = false
    }

    private val _serendipityHistory = mutableSetOf<String>()

    fun getRandomUnfavoritedArtist(allArtistsList: List<Artist>, favoritedIds: Set<String>): Artist? {
        if (allArtistsList.isEmpty()) return null
        val pool = allArtistsList
            .filter { it.id !in favoritedIds && it.id !in _serendipityHistory }
            .ifEmpty { allArtistsList.filter { it.id !in favoritedIds } }
            .ifEmpty { allArtistsList }
        val pick = pool.random()
        _serendipityHistory.add(pick.id)
        return pick
    }
}
