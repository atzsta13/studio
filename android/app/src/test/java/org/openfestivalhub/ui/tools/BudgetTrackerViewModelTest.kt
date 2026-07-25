package org.openfestivalhub.ui.tools

import org.openfestivalhub.InMemorySharedPreferences
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.Assert.*
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class BudgetTrackerViewModelTest {

    @Test
    fun `initial total spent is zero`() {
        val prefs = InMemorySharedPreferences()
        val vm = BudgetTrackerViewModel(prefs)
        assertEquals(0, vm.totalSpent.value)
    }

    @Test
    fun `addEntry increases total spent`() {
        val prefs = InMemorySharedPreferences()
        val vm = BudgetTrackerViewModel(prefs)
        vm.addEntry(500, "Dinner")
        assertEquals(500, vm.totalSpent.value)
        assertEquals(1, vm.entries.value.size)
        assertEquals("Dinner", vm.entries.value.first().label)
    }

    @Test
    fun `resetDay clears all entries`() {
        val prefs = InMemorySharedPreferences()
        val vm = BudgetTrackerViewModel(prefs)
        vm.addEntry(100)
        vm.resetDay()
        assertEquals(0, vm.totalSpent.value)
        assertTrue(vm.entries.value.isEmpty())
    }

    @Test
    fun `setBudget updates budget value`() {
        val prefs = InMemorySharedPreferences()
        val vm = BudgetTrackerViewModel(prefs)
        vm.setBudget(5000)
        assertEquals(5000, vm.budget.value)
        assertEquals(5000, prefs.getInt("budget_tracker_budget", 0))
    }
}
