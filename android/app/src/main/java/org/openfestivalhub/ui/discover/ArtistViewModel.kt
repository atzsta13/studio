package org.openfestivalhub.ui.discover

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import org.openfestivalhub.data.local.FavoriteArtist
import org.openfestivalhub.data.local.UserDao
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class ArtistViewModel(private val userDao: UserDao) : ViewModel() {

    /**
     * StateFlow tracking the set of IDs for artists marked as favorites (all tiers combined).
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
     * StateFlow tracking Must See (tier 1) favorite artists.
     */
    val mustSeeArtistIds: StateFlow<Set<String>> = userDao.getMustSeeArtists()
        .map { favorites -> favorites.map { it.artistId }.toSet() }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptySet()
        )

    /**
     * StateFlow tracking Interested (tier 2) favorite artists.
     */
    val interestedArtistIds: StateFlow<Set<String>> = userDao.getInterestedArtists()
        .map { favorites -> favorites.map { it.artistId }.toSet() }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptySet()
        )

    /**
     * Sets the favorite tier for an artist.
     * Tier options: "must_see" or "interested"
     * If artist is not yet favorited, creates a new entry with the given tier.
     * If already favorited, updates the existing tier.
     */
    fun setFavoriteTier(artistId: String, tier: String) {
        viewModelScope.launch {
            if (favoriteArtistIds.value.contains(artistId)) {
                // Update existing favorite's tier
                userDao.updateFavoriteTier(artistId, tier)
            } else {
                // Add new favorite with given tier
                userDao.addFavorite(
                    FavoriteArtist(
                        artistId = artistId,
                        timestamp = System.currentTimeMillis(),
                        tier = tier
                    )
                )
            }
        }
    }

    /**
     * Removes an artist from favorites entirely.
     */
    fun removeFavorite(artistId: String) {
        viewModelScope.launch {
            userDao.removeFavorite(artistId)
        }
    }

    /**
     * Toggles the favorite status of an artist (backward compatibility).
     * If already favorited, removes it; otherwise, adds it as "interested" tier.
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
                        timestamp = System.currentTimeMillis(),
                        tier = "interested"
                    )
                )
            }
        }
    }
}
