package com.example.szigerinsider2026.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.ILineupRepository
import com.example.szigerinsider2026.data.repository.LineupRepository
import com.example.szigerinsider2026.data.config.FestivalConfig
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DiscoverViewModel(
    private val repository: ILineupRepository,
    private val context: Context? = null
) : ViewModel() {

    private val localScoutRepository = context?.let { com.example.szigerinsider2026.data.repository.LocalScoutRepository(it) }

    private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())
    
    // Local AI States
    val isLocalAiDownloaded = localScoutRepository?.isModelDownloaded ?: MutableStateFlow(false)
    val downloadProgress = localScoutRepository?.downloadProgress ?: MutableStateFlow(0f)
    
    private val _isListening = MutableStateFlow(false)
    val isListening = _isListening.asStateFlow()

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
    private val _selectedYear = MutableStateFlow(FestivalConfig.current.dates.year.toString())

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
        _searchQuery,
        _countryFilter
    ) { (artists, sort, day), (genre, vibe, stage), query, country ->
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

    fun scanForLocalModel() {
        localScoutRepository?.scanForLocalModel()
    }

    fun startLocationScout() {
        viewModelScope.launch {
            _isListening.value = true
            try {
                val loc = getLocation()
                if (loc == null) {
                    runLocalScout("I am trying to find who is playing near me, but GPS location is unavailable. Based on the lineup, who is performing right now?")
                    return@launch
                }
                val nearestStageName = findNearestStage(loc.latitude, loc.longitude)
                if (nearestStageName == null) {
                    runLocalScout("I am at the festival, but I couldn't resolve the nearest stage. Based on the lineup, who is performing right now?")
                    return@launch
                }
                runLocalScout("I am currently near the '$nearestStageName'. Who is performing on this stage right now, what is their style/vibe, and who is playing next?")
            } finally {
                _isListening.value = false
            }
        }
    }

    private fun getLocation(): android.location.Location? {
        val ctx = context ?: return null
        val lm = ctx.getSystemService(Context.LOCATION_SERVICE) as android.location.LocationManager
        return try {
            lm.getLastKnownLocation(android.location.LocationManager.GPS_PROVIDER)
                ?: lm.getLastKnownLocation(android.location.LocationManager.NETWORK_PROVIDER)
        } catch (_: SecurityException) { null }
    }

    private suspend fun findNearestStage(userLat: Double, userLng: Double): String? {
        val ctx = context ?: return null
        val poiRepo = com.example.szigerinsider2026.data.repository.POIRepository(ctx)
        val stages = poiRepo.getPOIs().filter { it.type == "stage" }
        if (stages.isEmpty()) return null

        // 1. Try GPS distance if stages have lat/lng
        val stagesWithGps = stages.filter { it.lat != null && it.lng != null }
        if (stagesWithGps.isNotEmpty()) {
            val nearest = stagesWithGps.minByOrNull { stage ->
                val results = FloatArray(1)
                android.location.Location.distanceBetween(userLat, userLng, stage.lat!!, stage.lng!!, results)
                results[0]
            }
            return nearest?.name
        }

        // 2. Fallback to Map heuristic if they only have mapCoords
        val config = FestivalConfig.current
        val festLat = config.location.lat
        val festLng = config.location.lng
        
        val deltaLat = userLat - festLat
        val deltaLng = userLng - festLng
        
        // If user is more than ~10km away from festival center, simulate they are right on the grounds
        val isFar = Math.abs(deltaLat) > 0.1 || Math.abs(deltaLng) > 0.1
        val userMapX = if (isFar) 45.0 else (50.0 + deltaLng * 5000.0).coerceIn(0.0, 100.0)
        val userMapY = if (isFar) 50.0 else (50.0 - deltaLat * 7400.0).coerceIn(0.0, 100.0)
        
        val stagesWithMap = stages.filter { it.mapCoords != null }
        if (stagesWithMap.isEmpty()) return null
        
        val nearestStage = stagesWithMap.minByOrNull { stage ->
            val dx = userMapX - stage.mapCoords!!.x
            val dy = userMapY - stage.mapCoords!!.y
            dx * dx + dy * dy
        }
        
        return nearestStage?.name
    }

    fun runLocalScout(prompt: String) {
        viewModelScope.launch {
            _isLocalAiLoading.value = true
            _localAiResponse.value = "" // Start with empty string
            
            val currentFocus = _selectedStage.value
            val contextPrefix = if (currentFocus != null) {
                "The user is currently focusing on the '$currentFocus' territory. "
            } else ""

            localScoutRepository?.getLocalRecommendationsStreaming(
                contextPrefix + prompt,
                _allArtists.value,
                FestivalConfig.current.aiPersona
            )
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
