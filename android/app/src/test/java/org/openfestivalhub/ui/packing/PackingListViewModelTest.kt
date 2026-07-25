package org.openfestivalhub.ui.packing

import org.openfestivalhub.InMemorySharedPreferences
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class PackingListViewModelTest {

    @Test
    fun `initial state has correct total count and 0 checked items`() = runTest {
        val prefs = InMemorySharedPreferences()
        val vm = PackingListViewModel(prefs)

        assertTrue(vm.items.value.isNotEmpty())
        assertEquals(vm.items.value.size, vm.totalCount)
        assertEquals(0, vm.checkedCount.value)
        assertTrue(vm.checkedIds.value.isEmpty())
    }

    @Test
    fun `toggle adds and removes item from checked state`() = runTest {
        val prefs = InMemorySharedPreferences()
        val vm = PackingListViewModel(prefs)
        val itemId = vm.items.value.first().id

        // Toggle on
        vm.toggle(itemId)
        assertEquals(1, vm.checkedCount.value)
        assertTrue(vm.checkedIds.value.contains(itemId))

        // Toggle off
        vm.toggle(itemId)
        assertEquals(0, vm.checkedCount.value)
        assertTrue(vm.checkedIds.value.isEmpty())
    }

    @Test
    fun `resetAll clears all checked items`() = runTest {
        val prefs = InMemorySharedPreferences()
        val vm = PackingListViewModel(prefs)
        
        vm.toggle(vm.items.value[0].id)
        vm.toggle(vm.items.value[1].id)
        
        assertEquals(2, vm.checkedCount.value)
        
        vm.resetAll()
        
        assertEquals(0, vm.checkedCount.value)
        assertTrue(vm.checkedIds.value.isEmpty())
    }
}
