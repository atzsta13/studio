package com.example.szigerinsider2026.ui.discover

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
class LineupStatsViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private val fakeLineup = listOf(
        Artist(id = "a1", artist = "A1", genres = listOf("METAL"), vibes = listOf("HEAVY"), countryCode = "SE"),
        Artist(id = "a2", artist = "A2", genres = listOf("METAL", "PROG"), vibes = listOf("TECHNICAL"), countryCode = "SE"),
        Artist(id = "a3", artist = "A3", genres = listOf("ROCK"), vibes = listOf("HEAVY"), countryCode = "US"),
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
    fun `calculates genre stats correctly`() = runTest {
        val vm = LineupStatsViewModel(fakeRepo)
        advanceUntilIdle()
        // METAL: 2, PROG: 1, ROCK: 1
        assertEquals(3, vm.genreStats.value.size)
        assertEquals("METAL" to 2, vm.genreStats.value.first())
    }

    @Test
    fun `calculates vibe stats correctly`() = runTest {
        val vm = LineupStatsViewModel(fakeRepo)
        advanceUntilIdle()
        // HEAVY: 2, TECHNICAL: 1
        assertEquals("HEAVY" to 2, vm.vibeStats.value.first())
    }

    @Test
    fun `calculates total artists correctly`() = runTest {
        val vm = LineupStatsViewModel(fakeRepo)
        advanceUntilIdle()
        assertEquals(3, vm.totalArtists.value)
    }
}
