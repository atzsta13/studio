package com.example.szigerinsider2026.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM favorite_artists")
    fun getAllFavorites(): Flow<List<FavoriteArtist>>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'must_see'")
    fun getMustSeeArtists(): Flow<List<FavoriteArtist>>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'interested'")
    fun getInterestedArtists(): Flow<List<FavoriteArtist>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(favorite: FavoriteArtist)

    @Query("DELETE FROM favorite_artists WHERE artistId = :artistId")
    suspend fun removeFavorite(artistId: String)

    @Query("UPDATE favorite_artists SET tier = :tier WHERE artistId = :artistId")
    suspend fun updateFavoriteTier(artistId: String, tier: String)
}
