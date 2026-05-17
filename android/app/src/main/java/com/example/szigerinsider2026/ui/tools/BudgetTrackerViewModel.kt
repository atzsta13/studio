package com.example.szigerinsider2026.ui.tools

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private const val PREFS_NAME = "budget_tracker"
private const val KEY_ENTRIES = "budget_tracker_entries"
private const val KEY_BUDGET = "budget_tracker_budget"
private const val DEFAULT_BUDGET = 10_000

@Serializable
data class BudgetEntry(
    val amount: Int,
    val label: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

class BudgetTrackerViewModel(private val context: Context) : ViewModel() {

    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    private val _entries = MutableStateFlow<List<BudgetEntry>>(loadEntries())
    val entries: StateFlow<List<BudgetEntry>> = _entries

    private val _budget = MutableStateFlow(prefs.getInt(KEY_BUDGET, DEFAULT_BUDGET))
    val budget: StateFlow<Int> = _budget

    private val _totalSpent = MutableStateFlow(_entries.value.sumOf { it.amount })
    val totalSpent: StateFlow<Int> = _totalSpent

    fun addEntry(amount: Int, label: String = "") {
        if (amount <= 0) return
        val entry = BudgetEntry(amount = amount, label = label)
        val updated = listOf(entry) + _entries.value
        _entries.value = updated
        _totalSpent.value = updated.sumOf { it.amount }
        saveEntries(updated)
    }

    fun resetDay() {
        _entries.value = emptyList()
        _totalSpent.value = 0
        saveEntries(emptyList())
    }

    fun setBudget(amount: Int) {
        if (amount <= 0) return
        _budget.value = amount
        prefs.edit().putInt(KEY_BUDGET, amount).apply()
    }

    private fun loadEntries(): List<BudgetEntry> {
        val raw = prefs.getString(KEY_ENTRIES, null) ?: return emptyList()
        return try {
            json.decodeFromString<List<BudgetEntry>>(raw)
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun saveEntries(entries: List<BudgetEntry>) {
        prefs.edit()
            .putString(KEY_ENTRIES, json.encodeToString(entries))
            .apply()
    }

    companion object {
        fun Factory(context: Context): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                BudgetTrackerViewModel(context.applicationContext) as T
        }
    }
}
