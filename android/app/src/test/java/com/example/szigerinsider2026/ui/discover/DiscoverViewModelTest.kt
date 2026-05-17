package com.example.szigerinsider2026.ui.discover

import app.cash.turbine.test
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.ILineupRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DiscoverViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private fun makeArtist(
        id: String,
        genres: List<String> = emptyList(),
        vibes: List<String> = emptyList(),
        day: String? = null,
        countryCode: String = "DE",
        isHeadliner: Boolean = false,
    ) = Artist(
        id = id, name = "Artist $id", stage = null, day = day,
        startTime = null, endTime = null, genres = genres, vibes = vibes,
        isHeadliner = isHeadliner, countryCode = countryCode
    )

    private val fakeLineup = listOf(
        makeArtist("a1", genres = listOf("TECHNO"), vibes = listOf("Dance"), day = "Friday",   countryCode = "DE", isHeadliner = true),
        makeArtist("a2", genres = listOf("POP"),    vibes = listOf("Sing-along"), day = "Saturday", countryCode = "US"),
        makeArtist("a3", genres = listOf("ROCK"),   vibes = listOf("Anthemic"), day = "Friday",   countryCode = "GB"),
        makeArtist("a4", genres = listOf("INDIE"),  vibes = listOf("Feel-good"), day = "Sunday",   countryCode = "HU"),
    )

    private val fakeRepo = object : ILineupRepository {
        override suspend fun getLineup(year: String) = fakeLineup
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
    fun `initial state is loading`() {
        val vm = DiscoverViewModel(fakeRepo)
        // isLoading starts true before init coroutine completes
        assertTrue(vm.isLoading.value)
    }

    @Test
    fun `loads all artists on init`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        assertEquals(4, vm.allArtists.value.size)
        assertFalse(vm.isLoading.value)
    }

    @Test
    fun `search query filters artists by name`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.setSearchQuery("Artist a1")
        advanceUntilIdle()
        val filtered = vm.filteredArtists.value
        assertEquals(1, filtered.size)
        assertEquals("a1", filtered.first().id)
    }

    @Test
    fun `genre filter returns only matching artists`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.selectGenre("TECHNO")
        advanceUntilIdle()
        val filtered = vm.filteredArtists.value
        assertTrue(filtered.all { it.genres.contains("TECHNO") })
    }

    @Test
    fun `day filter returns only artists on that day`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.selectDay("Friday")
        advanceUntilIdle()
        val filtered = vm.filteredArtists.value
        assertTrue(filtered.all { it.day == "Friday" })
        assertEquals(2, filtered.size)
    }

    @Test
    fun `country filter returns only artists from that country`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.setCountryFilter("US")
        advanceUntilIdle()
        val filtered = vm.filteredArtists.value
        assertTrue(filtered.all { it.countryCode == "US" })
    }

    @Test
    fun `clearing genre filter restores all artists`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.selectGenre("TECHNO")
        vm.selectGenre(null)
        advanceUntilIdle()
        assertEquals(4, vm.filteredArtists.value.size)
    }

    @Test
    fun `availableDays emits distinct days in festival order`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        advanceUntilIdle()
        vm.availableDays.test {
            val days = awaitItem()
            // May receive emptyList initially — skip and grab the populated emission
            val populated = if (days.isEmpty()) awaitItem() else days
            // Friday before Saturday before Sunday
            val fridayIdx = populated.indexOf("Friday")
            val satIdx    = populated.indexOf("Saturday")
            val sunIdx    = populated.indexOf("Sunday")
            assertTrue(fridayIdx < satIdx)
            assertTrue(satIdx < sunIdx)
            cancelAndIgnoreRemainingEvents()
        }
    }
}
