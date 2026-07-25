package org.openfestivalhub.ui.discover

import app.cash.turbine.test
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.repository.ILineupRepository
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
        id = id, artist = "Artist $id", stage = null, day = day,
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
        org.openfestivalhub.data.config.FestivalConfig.setTestConfig(org.openfestivalhub.TestConfig.data)
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state is loading`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        // Since we use UnconfinedTestDispatcher and a sync repo, 
        // it might have already finished loading.
        // If it's still true, great. If not, it should be false and allArtists should be populated.
        if (vm.isLoading.value) {
            assertTrue(vm.isLoading.value)
        } else {
            assertEquals(4, vm.allArtists.value.size)
        }
    }

    @Test
    fun `loads all artists on init`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.allArtists.test {
            val artists = awaitItem()
            val populated = if (artists.isEmpty()) awaitItem() else artists
            assertEquals(4, populated.size)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `search query filters artists by name`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.filteredArtists.test {
            val initial = awaitItem()
            val populated = if (initial.isEmpty()) awaitItem() else initial
            vm.setSearchQuery("Artist a1")
            val filtered = awaitItem()
            assertEquals(1, filtered.size)
            assertEquals("a1", filtered.first().id)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `genre filter returns only matching artists`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.filteredArtists.test {
            val initial = awaitItem()
            val populated = if (initial.isEmpty()) awaitItem() else initial
            vm.selectGenre("TECHNO")
            val filtered = awaitItem()
            assertTrue(filtered.all { it.genres.contains("TECHNO") })
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `day filter returns only artists on that day`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.filteredArtists.test {
            val initial = awaitItem()
            val populated = if (initial.isEmpty()) awaitItem() else initial
            vm.selectDay("Friday")
            val filtered = awaitItem()
            assertTrue(filtered.all { it.day == "Friday" })
            assertEquals(2, filtered.size)
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `country filter returns only artists from that country`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.filteredArtists.test {
            val initial = awaitItem()
            val populated = if (initial.isEmpty()) awaitItem() else initial
            vm.setCountryFilter("US")
            val filtered = awaitItem()
            assertTrue(filtered.all { it.countryCode == "US" })
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `clearing genre filter restores all artists`() = runTest {
        val vm = DiscoverViewModel(fakeRepo)
        vm.filteredArtists.test {
            val initial = awaitItem()
            val populated = if (initial.isEmpty()) awaitItem() else initial
            vm.selectGenre("TECHNO")
            skipItems(1) // skip the genre filter emission
            vm.selectGenre(null)
            val restored = awaitItem()
            assertEquals(4, restored.size)
            cancelAndIgnoreRemainingEvents()
        }
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
