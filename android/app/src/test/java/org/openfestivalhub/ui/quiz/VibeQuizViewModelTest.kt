package org.openfestivalhub.ui.quiz

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
class VibeQuizViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()

    private fun makeArtist(id: String, genres: List<String>, vibes: List<String>, isHeadliner: Boolean = false) =
        Artist(
            id = id, artist = "Artist $id", stage = null, day = null,
            startTime = null, endTime = null, genres = genres, vibes = vibes,
            isHeadliner = isHeadliner, countryCode = "DE"
        )

    private val fakeLineup = listOf(
        makeArtist("techno-1", listOf("TECHNO"), listOf("Dance", "Hard", "Rave")),
        makeArtist("pop-1",    listOf("POP"),   listOf("Sing-along", "Feel-good"), isHeadliner = true),
        makeArtist("indie-1",  listOf("INDIE"),  listOf("Feel-good", "Nostalgic")),
        makeArtist("metal-1",  listOf("METAL"),  listOf("Hard", "High Energy")),
        makeArtist("jazz-1",   listOf("JAZZ"),   listOf("Chill", "Flow")),
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
    fun `initial step is 0`() {
        val vm = VibeQuizViewModel(fakeRepo)
        assertEquals(0, vm.step)
    }

    @Test
    fun `setEnergy updates energy state`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.energy = "CHILL"
        assertEquals("CHILL", vm.energy)
    }

    @Test
    fun `toggleGenre adds genre to selectedGenres`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.toggleGenre("TECHNO")
        assertTrue(vm.selectedGenres.contains("TECHNO"))
    }

    @Test
    fun `toggleGenre removes genre when already selected`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.toggleGenre("TECHNO")
        vm.toggleGenre("TECHNO")
        assertFalse(vm.selectedGenres.contains("TECHNO"))
    }

    @Test
    fun `toggleGenre caps selection at 2 genres`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.toggleGenre("TECHNO")
        vm.toggleGenre("POP")
        vm.toggleGenre("INDIE") // should be ignored
        assertEquals(2, vm.selectedGenres.size)
    }

    @Test
    fun `nextStep increments step`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.nextStep()
        assertEquals(1, vm.step)
    }

    @Test
    fun `prevStep decrements step but not below 0`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.prevStep()
        assertEquals(0, vm.step)
        vm.nextStep()
        vm.prevStep()
        assertEquals(0, vm.step)
    }

    @Test
    fun `reset clears all state`() {
        val vm = VibeQuizViewModel(fakeRepo)
        vm.energy = "UNHINGED"
        vm.toggleGenre("TECHNO")
        vm.step = 3
        vm.reset()
        assertEquals(0, vm.step)
        assertEquals("", vm.energy)
        assertTrue(vm.selectedGenres.isEmpty())
    }

    @Test
    fun `computeResults returns artists sorted by score`() = runTest {
        val vm = VibeQuizViewModel(fakeRepo)
        advanceUntilIdle()
        vm.energy = "UNHINGED"
        vm.toggleGenre("TECHNO")
        vm.moodTag = "HARD"
        vm.computeResults()
        advanceUntilIdle()
        val results = vm.results.value
        assertTrue(results.isNotEmpty())
        assertEquals("techno-1", results.first().id)
    }

    @Test
    fun `CHILL energy returns chill artists first`() = runTest {
        val vm = VibeQuizViewModel(fakeRepo)
        advanceUntilIdle()
        vm.energy = "CHILL"
        vm.toggleGenre("JAZZ")
        vm.moodTag = "NOSTALGIC"
        vm.computeResults()
        advanceUntilIdle()
        val results = vm.results.value
        assertTrue(results.isNotEmpty())
        assertEquals("jazz-1", results.first().id)
    }

    @Test
    fun `computeResults always returns at least 4 results when lineup is large enough`() = runTest {
        val vm = VibeQuizViewModel(fakeRepo)
        advanceUntilIdle()
        vm.energy = "BALANCED"
        vm.moodTag = "FRESH"
        vm.computeResults()
        advanceUntilIdle()
        assertTrue(vm.results.value.size >= 4)
    }
}
