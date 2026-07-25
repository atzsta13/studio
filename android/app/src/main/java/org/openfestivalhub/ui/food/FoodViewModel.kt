package org.openfestivalhub.ui.food

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import org.openfestivalhub.data.model.FoodVendor
import org.openfestivalhub.data.repository.FoodRepository
import org.openfestivalhub.data.repository.IFoodRepository
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class FoodViewModel(private val repository: IFoodRepository) : ViewModel() {

    private val _allVendors = MutableStateFlow<List<FoodVendor>>(emptyList())

    val searchQuery = MutableStateFlow("")
    val activeCategory = MutableStateFlow("ALL")
    val activeTags = MutableStateFlow<Set<String>>(emptySet())

    @OptIn(ExperimentalCoroutinesApi::class)
    val filtered: StateFlow<List<FoodVendor>> = combine(
        _allVendors, searchQuery, activeCategory, activeTags
    ) { all, query, cat, tags ->
        all.filter { v ->
            val matchesCat = cat == "ALL" || v.category.equals(cat, ignoreCase = true)
            val matchesTags = tags.all { tag ->
                when (tag) {
                    "budget" -> v.budgetOption != null
                    else -> v.tags.any { it.equals(tag, ignoreCase = true) }
                }
            }
            val matchesQuery = query.isBlank() ||
                v.name.contains(query, ignoreCase = true) ||
                v.cuisine?.contains(query, ignoreCase = true) == true ||
                v.description?.contains(query, ignoreCase = true) == true
            matchesCat && matchesTags && matchesQuery
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            _allVendors.value = repository.getFoodVendors()
        }
    }

    class Factory(private val context: Context) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            FoodViewModel(FoodRepository(context)) as T
    }
}
