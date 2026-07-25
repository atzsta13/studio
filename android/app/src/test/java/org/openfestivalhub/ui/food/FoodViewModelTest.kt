package org.openfestivalhub.ui.food

import app.cash.turbine.test
import org.openfestivalhub.data.model.FoodVendor
import org.openfestivalhub.data.repository.IFoodRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class FoodViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakeVendors = listOf(
        FoodVendor(id = "v1", name = "Burger Shack", category = "MEAT", cuisine = "American", tags = listOf("burger"), budgetOption = "€10"),
        FoodVendor(id = "v2", name = "Vegan Delight", category = "VEGAN", cuisine = "International", tags = listOf("salad", "vegan")),
        FoodVendor(id = "v3", name = "Pizza Place", category = "VEGETARIAN", cuisine = "Italian", tags = listOf("pizza")),
        FoodVendor(id = "v4", name = "Late Night Tacos", category = "MEAT", cuisine = "Mexican", tags = listOf("taco", "budget"), budgetOption = "€8"),
    )

    private val fakeRepo = object : IFoodRepository {
        override suspend fun getFoodVendors() = fakeVendors
    }

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `loads all vendors on init`() = runTest {
        val vm = FoodViewModel(fakeRepo)
        vm.filtered.test {
            assertEquals(4, awaitItem().size)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `search query filters vendors by name`() = runTest {
        val vm = FoodViewModel(fakeRepo)
        vm.filtered.test {
            skipItems(1) // skip initial
            vm.searchQuery.value = "Burger"
            val filtered = awaitItem()
            assertEquals(1, filtered.size)
            assertEquals("v1", filtered.first().id)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `category filter returns only matching vendors`() = runTest {
        val vm = FoodViewModel(fakeRepo)
        vm.filtered.test {
            skipItems(1)
            vm.activeCategory.value = "VEGAN"
            val filtered = awaitItem()
            assertEquals(1, filtered.size)
            assertTrue(filtered.all { it.category == "VEGAN" })
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `tags filter returns vendors with matching tags`() = runTest {
        val vm = FoodViewModel(fakeRepo)
        vm.filtered.test {
            skipItems(1)
            vm.activeTags.value = setOf("salad")
            val filtered = awaitItem()
            assertEquals(1, filtered.size)
            assertEquals("v2", filtered.first().id)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `budget tag filter returns vendors with budget options`() = runTest {
        val vm = FoodViewModel(fakeRepo)
        vm.filtered.test {
            skipItems(1)
            vm.activeTags.value = setOf("budget")
            val filtered = awaitItem()
            assertEquals(2, filtered.size)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
