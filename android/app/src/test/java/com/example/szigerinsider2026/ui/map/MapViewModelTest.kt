package com.example.szigerinsider2026.ui.map

import app.cash.turbine.test
import com.example.szigerinsider2026.data.model.FoodVendor
import com.example.szigerinsider2026.data.model.MapCoords
import com.example.szigerinsider2026.data.model.POI
import com.example.szigerinsider2026.data.repository.IFoodRepository
import com.example.szigerinsider2026.data.repository.IPOIRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class MapViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakePois = listOf(
        POI("poi1", "Main Stage", "stage", mapCoords = MapCoords(50, 50)),
        POI("poi2", "Water Station", "water", mapCoords = MapCoords(60, 60))
    )

    private val fakeVendors = listOf(
        FoodVendor("v1", "Burger Stand", category = "MEAT", mapCoords = MapCoords(70, 70))
    )

    private val fakePoiRepo = object : IPOIRepository {
        override suspend fun getPOIs(): List<POI> = fakePois
    }

    private val fakeFoodRepo = object : IFoodRepository {
        override suspend fun getFoodVendors(): List<FoodVendor> = fakeVendors
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
    fun `loads all POIs including food vendors on init`() = runTest {
        val vm = MapViewModel(fakePoiRepo, fakeFoodRepo)
        
        vm.filteredPois.test {
            val pois = awaitItem()
            // 2 POIs + 1 Food Vendor
            assertEquals(3, pois.size)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `filters POIs by category`() = runTest {
        val vm = MapViewModel(fakePoiRepo, fakeFoodRepo)
        
        vm.filteredPois.test {
            skipItems(1) // Skip initial "all"
            
            vm.selectCategory("water")
            val waterPois = awaitItem()
            assertEquals(1, waterPois.size)
            assertEquals("Water Station", waterPois.first().name)
            
            vm.selectCategory("food")
            val foodPois = awaitItem()
            assertEquals(1, foodPois.size)
            assertEquals("Burger Stand", foodPois.first().name)
            
            cancelAndIgnoreRemainingEvents()
        }
    }
}
