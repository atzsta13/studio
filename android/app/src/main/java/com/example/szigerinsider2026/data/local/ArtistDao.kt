package com.example.szigerinsider2026.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ArtistDao {
    @Query("SELECT * FROM artists WHERE year = :year ORDER BY artist ASC")
    fun getArtistsByYear(year: String): Flow<List<ArtistEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertArtists(artists: List<ArtistEntity>)

    @Query("DELETE FROM artists WHERE year = :year")
    suspend fun deleteArtistsByYear(year: String)
}
