package org.openfestivalhub.ui.tools

import app.cash.turbine.test
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.model.DailyForecast
import org.openfestivalhub.data.model.WeatherData
import org.openfestivalhub.data.repository.ILineupRepository
import org.openfestivalhub.data.repository.IWeatherRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ToolsViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakeWeather = WeatherData(
        daily = listOf(DailyForecast("2026-08-05", 35f, 20f, 10, 1)),
        rainAlert = false
    )

    private val fakeWeatherRepo = object : IWeatherRepository {
        override suspend fun getForecast(): WeatherData = fakeWeather
    }

    private val fakeLineupRepo = object : ILineupRepository {
        override suspend fun getLineup(year: String): List<Artist> = emptyList()
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
    fun `fetches weather on init`() = runTest {
        val vm = ToolsViewModel(fakeLineupRepo, fakeWeatherRepo)
        
        vm.weather.test {
            val weatherData = awaitItem()
            if (weatherData == null) {
                assertEquals(fakeWeather, awaitItem())
            } else {
                assertEquals(fakeWeather, weatherData)
            }
            cancelAndIgnoreRemainingEvents()
        }
        
        vm.isLoadingWeather.test {
            assertFalse(awaitItem())
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `syncData emits success`() = runTest {
        val vm = ToolsViewModel(fakeLineupRepo, fakeWeatherRepo)
        
        vm.syncResult.test {
            vm.syncData()
            val result = awaitItem()
            assertEquals(true, result)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
