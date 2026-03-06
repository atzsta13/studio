package com.example.szigerinsider2026.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.local.FavoriteArtist
import com.example.szigerinsider2026.data.local.UserDao
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ArtistViewModel(private val userDao: UserDao) : ViewModel() {

    /**
     * StateFlow tracking the set of IDs for artists marked as favorites.
     * Maps the list of FavoriteArtist entities to a Set of artistId strings.
     */
    val favoriteArtistIds: StateFlow<Set<String>> = userDao.getAllFavorites()
        .map { favorites -> favorites.map { it.artistId }.toSet() }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptySet()
        )

    /**
     * Toggles the favorite status of an artist.
     * If already favorited, removes it; otherwise, adds it with a current timestamp.
     */
    fun toggleFavorite(artistId: String) {
        viewModelScope.launch {
            val isCurrentlyFavorite = favoriteArtistIds.value.contains(artistId)
            if (isCurrentlyFavorite) {
                userDao.removeFavorite(artistId)
            } else {
                userDao.addFavorite(
                    FavoriteArtist(
                        artistId = artistId,
                        timestamp = System.currentTimeMillis()
                    )
                )
            }
        }
    }
}
