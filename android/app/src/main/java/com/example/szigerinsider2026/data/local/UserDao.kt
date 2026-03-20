package com.example.szigerinsider2026.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    // User Progress
    @Query("SELECT * FROM user_progress WHERE id = 1")
    fun getUserProgress(): Flow<UserProgress?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProgress(progress: UserProgress)

    // Favorites
    @Query("SELECT * FROM favorite_artists ORDER BY timestamp DESC")
    fun getAllFavorites(): Flow<List<FavoriteArtist>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(favorite: FavoriteArtist)

    @Query("DELETE FROM favorite_artists WHERE artistId = :artistId")
    suspend fun removeFavorite(artistId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM favorite_artists WHERE artistId = :artistId)")
    fun isFavorite(artistId: String): Flow<Boolean>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'must_see' ORDER BY timestamp DESC")
    fun getMustSeeArtists(): Flow<List<FavoriteArtist>>

    @Query("SELECT * FROM favorite_artists WHERE tier = 'interested' ORDER BY timestamp DESC")
    fun getInterestedArtists(): Flow<List<FavoriteArtist>>

    @Query("SELECT tier FROM favorite_artists WHERE artistId = :artistId")
    fun getFavoriteTier(artistId: String): Flow<String?>

    @Query("UPDATE favorite_artists SET tier = :tier WHERE artistId = :artistId")
    suspend fun updateFavoriteTier(artistId: String, tier: String)

    @Query("UPDATE user_progress SET legendXp = :xp WHERE id = 1")
    suspend fun updateXP(xp: Int)

    @Query("UPDATE user_progress SET completedChallengeIds = :ids WHERE id = 1")
    suspend fun updateCompletedChallenges(ids: String)

    @Query("UPDATE user_progress SET quizCompleted = 1 WHERE id = 1")
    suspend fun markQuizCompleted()
}
