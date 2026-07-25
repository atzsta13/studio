package org.openfestivalhub.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorite_artists")
data class FavoriteArtist(
    @PrimaryKey
    val artistId: String,
    val timestamp: Long = System.currentTimeMillis(),
    val tier: String = "interested" // interested, must-see, etc.
)
