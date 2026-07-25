package org.openfestivalhub.ui.packing

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

data class PackingItem(val id: String, val label: String, val section: String)

private val ALL_ITEMS: List<PackingItem> = listOf(
    // CAMP BASE
    PackingItem("tent", "TENT", "CAMP BASE"),
    PackingItem("sleeping_bag", "SLEEPING BAG", "CAMP BASE"),
    PackingItem("sleeping_mat", "SLEEPING MAT", "CAMP BASE"),
    PackingItem("tarp", "TARP", "CAMP BASE"),
    PackingItem("tent_pegs", "TENT PEGS", "CAMP BASE"),
    PackingItem("mallet", "MALLET", "CAMP BASE"),
    // ESSENTIALS
    PackingItem("wristband", "WRISTBAND", "ESSENTIALS"),
    PackingItem("passport_id", "PASSPORT / ID", "ESSENTIALS"),
    PackingItem("cash_huf", "CASH (HUF)", "ESSENTIALS"),
    PackingItem("phone_charger", "PHONE CHARGER", "ESSENTIALS"),
    PackingItem("power_bank", "POWER BANK", "ESSENTIALS"),
    PackingItem("earphones", "EARPHONES", "ESSENTIALS"),
    PackingItem("medications", "MEDICATIONS", "ESSENTIALS"),
    // CLOTHING
    PackingItem("rain_jacket", "RAIN JACKET", "CLOTHING"),
    PackingItem("warm_layer", "WARM LAYER", "CLOTHING"),
    PackingItem("comfy_shoes", "COMFY SHOES", "CLOTHING"),
    PackingItem("flip_flops", "FLIP FLOPS", "CLOTHING"),
    PackingItem("hat", "HAT", "CLOTHING"),
    PackingItem("sunglasses", "SUNGLASSES", "CLOTHING"),
    // HEALTH & SAFETY
    PackingItem("sunscreen", "SUNSCREEN", "HEALTH & SAFETY"),
    PackingItem("insect_repellent", "INSECT REPELLENT", "HEALTH & SAFETY"),
    PackingItem("painkillers", "PAINKILLERS", "HEALTH & SAFETY"),
    PackingItem("plasters", "PLASTERS", "HEALTH & SAFETY"),
    PackingItem("hand_sanitiser", "HAND SANITISER", "HEALTH & SAFETY"),
    PackingItem("earplugs", "EARPLUGS", "HEALTH & SAFETY"),
    // FOOD & DRINK
    PackingItem("water_bottle", "WATER BOTTLE", "FOOD & DRINK"),
    PackingItem("snacks", "SNACKS", "FOOD & DRINK"),
    PackingItem("reusable_cup", "REUSABLE CUP", "FOOD & DRINK"),
)

private const val PREFS_NAME = "packing_list"
private const val KEY_CHECKED_IDS = "checked_ids"

class PackingListViewModel(private val prefs: SharedPreferences) : ViewModel() {

    constructor(context: Context) : this(context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE))

    val items: StateFlow<List<PackingItem>> = MutableStateFlow(ALL_ITEMS)

    private val _checkedIds = MutableStateFlow<Set<String>>(loadCheckedIds())
    val checkedIds: StateFlow<Set<String>> = _checkedIds

    val totalCount: Int = ALL_ITEMS.size

    private val _checkedCount = MutableStateFlow(_checkedIds.value.size)
    val checkedCount: StateFlow<Int> = _checkedCount

    fun toggle(itemId: String) {
        val current = _checkedIds.value.toMutableSet()
        if (itemId in current) current.remove(itemId) else current.add(itemId)
        _checkedIds.value = current
        _checkedCount.value = current.size
        saveCheckedIds(current)
    }

    fun resetAll() {
        _checkedIds.value = emptySet()
        _checkedCount.value = 0
        saveCheckedIds(emptySet())
    }

    private fun loadCheckedIds(): Set<String> {
        val json = prefs.getString(KEY_CHECKED_IDS, null) ?: return emptySet()
        return try {
            Json.decodeFromString<List<String>>(json).toSet()
        } catch (_: Exception) {
            emptySet()
        }
    }

    private fun saveCheckedIds(ids: Set<String>) {
        prefs.edit()
            .putString(KEY_CHECKED_IDS, Json.encodeToString(ids.toList()))
            .apply()
    }

    companion object {
        fun factory(context: Context): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                PackingListViewModel(context.applicationContext) as T
        }
    }
}
