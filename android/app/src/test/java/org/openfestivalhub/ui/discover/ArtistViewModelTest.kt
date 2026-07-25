package org.openfestivalhub.ui.discover

import app.cash.turbine.test
import org.openfestivalhub.data.local.FavoriteArtist
import org.openfestivalhub.data.local.UserDao
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class FakeUserDao : UserDao {
    private val favoritesFlow = MutableStateFlow<List<FavoriteArtist>>(emptyList())

    override fun getAllFavorites(): Flow<List<FavoriteArtist>> = favoritesFlow

    override fun getMustSeeArtists(): Flow<List<FavoriteArtist>> = 
        favoritesFlow.map { list -> list.filter { it.tier == "must_see" } }

    override fun getInterestedArtists(): Flow<List<FavoriteArtist>> = 
        favoritesFlow.map { list -> list.filter { it.tier == "interested" } }

    override suspend fun addFavorite(favorite: FavoriteArtist) {
        val current = favoritesFlow.value.toMutableList()
        current.removeAll { it.artistId == favorite.artistId }
        current.add(favorite)
        favoritesFlow.value = current
    }

    override suspend fun removeFavorite(artistId: String) {
        val current = favoritesFlow.value.toMutableList()
        current.removeAll { it.artistId == artistId }
        favoritesFlow.value = current
    }

    override suspend fun updateFavoriteTier(artistId: String, tier: String) {
        val current = favoritesFlow.value.toMutableList()
        val index = current.indexOfFirst { it.artistId == artistId }
        if (index != -1) {
            val updated = current[index].copy(tier = tier)
            current[index] = updated
            favoritesFlow.value = current
        }
    }
}

@OptIn(ExperimentalCoroutinesApi::class)
class ArtistViewModelTest {

    private val testDispatcher = UnconfinedTestDispatcher()
    private lateinit var fakeDao: FakeUserDao

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        fakeDao = FakeUserDao()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state is empty`() = runTest {
        val vm = ArtistViewModel(fakeDao)
        vm.favoriteArtistIds.test {
            val items = awaitItem()
            assertTrue(items.isEmpty())
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `setFavoriteTier adds new favorite`() = runTest {
        val vm = ArtistViewModel(fakeDao)
        vm.favoriteArtistIds.test {
            skipItems(1) // Initial
            vm.setFavoriteTier("a1", "must_see")
            val updated = awaitItem()
            assertEquals(1, updated.size)
            assertTrue(updated.contains("a1"))
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `setFavoriteTier updates existing favorite`() = runTest {
        val vm = ArtistViewModel(fakeDao)
        vm.setFavoriteTier("a1", "interested")
        
        vm.mustSeeArtistIds.test {
            skipItems(1)
            vm.setFavoriteTier("a1", "must_see")
            val mustSee = awaitItem()
            assertEquals(1, mustSee.size)
            assertTrue(mustSee.contains("a1"))
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `removeFavorite removes from all flows`() = runTest {
        val vm = ArtistViewModel(fakeDao)
        vm.setFavoriteTier("a1", "must_see")
        
        vm.favoriteArtistIds.test {
            skipItems(1)
            vm.removeFavorite("a1")
            val empty = awaitItem()
            assertTrue(empty.isEmpty())
            cancelAndIgnoreRemainingEvents()
        }
    }

    @Test
    fun `toggleFavorite toggles interested state`() = runTest {
        val vm = ArtistViewModel(fakeDao)
        
        vm.favoriteArtistIds.test {
            skipItems(1)
            
            // Add
            vm.toggleFavorite("a1")
            val added = awaitItem()
            assertTrue(added.contains("a1"))
            
            // Remove
            vm.toggleFavorite("a1")
            val removed = awaitItem()
            assertTrue(removed.isEmpty())
            
            cancelAndIgnoreRemainingEvents()
        }
    }
}
