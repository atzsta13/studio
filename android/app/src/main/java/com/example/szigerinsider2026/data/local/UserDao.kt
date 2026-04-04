package com.example.szigerinsider2026.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM favorite_artists ORDER BY timestamp DESC")
    fun getAllFavorites(): Flow<List<FavoriteArtist>>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'must-see' ORDER BY timestamp DESC")
    fun getMustSeeArtists(): Flow<List<FavoriteArtist>>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'interested' ORDER BY timestamp DESC")
    fun getInterestedArtists(): Flow<List<FavoriteArtist>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(favorite: FavoriteArtist)

    @Query("DELETE FROM favorite_artists WHERE artistId = :artistId")
    suspend fun removeFavorite(artistId: String)

    @Query("UPDATE favorite_artists SET tier = :tier WHERE artistId = :artistId")
    suspend fun updateFavoriteTier(artistId: String, tier: String)

    @Query("SELECT * FROM user_progress WHERE id = 1")
    fun getUserProgress(): Flow<UserProgress?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUserProgress(progress: UserProgress)
}
