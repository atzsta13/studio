package com.example.szigerinsider2026.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorite_artists")
data class FavoriteArtist(
    @PrimaryKey
    val artistId: String,
    val timestamp: Long,
    val tier: String = "interested" // "must_see" | "interested"
)
