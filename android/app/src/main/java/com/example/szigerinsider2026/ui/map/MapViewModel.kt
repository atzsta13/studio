package com.example.szigerinsider2026.ui.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.MapCoords
import com.example.szigerinsider2026.data.model.POI
import com.example.szigerinsider2026.data.repository.FoodRepository
import com.example.szigerinsider2026.data.repository.POIRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MapViewModel(
    private val poiRepository: POIRepository,
    private val foodRepository: FoodRepository
) : ViewModel() {

    private val _allPois = MutableStateFlow<List<POI>>(emptyList())
    
    private val _activeCategory = MutableStateFlow("all")
    val activeCategory: StateFlow<String> = _activeCategory

    // Hardcoded stages as POIs
    private val stages = listOf(
        POI("stage-main", "Main Stage", "stage", mapCoords = MapCoords(42, 48)),
        POI("stage-revolut", "Revolut Stage", "stage", mapCoords = MapCoords(28, 38)),
        POI("stage-colosseum", "Colosseum", "stage", mapCoords = MapCoords(35, 22)),
        POI("stage-bolt", "Bolt Party Arena", "stage", mapCoords = MapCoords(22, 55)),
        POI("stage-a38", "A38 Stage", "stage", mapCoords = MapCoords(12, 42)),
        POI("stage-world", "World Music Stage", "stage", mapCoords = MapCoords(62, 72))
    )

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val pois = poiRepository.getPOIs()
            val foodVendors = foodRepository.getFoodVendors()
            
            val foodPois = foodVendors.map { f ->
                POI(f.id, f.name, "food", mapCoords = f.mapCoords)
            }
            
            _allPois.value = stages + foodPois + pois
        }
    }

    val filteredPois: StateFlow<List<POI>> = combine(_allPois, _activeCategory) { pois, category ->
        when (category) {
            "all" -> pois
            "music" -> pois.filter { it.type == "stage" }
            "food" -> pois.filter { it.type == "food" }
            "water" -> pois.filter { it.type == "water" }
            else -> pois.filter { it.type == category }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun selectCategory(category: String) {
        _activeCategory.value = category
    }
}
