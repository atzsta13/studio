package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.local.AppDatabase
import com.example.szigerinsider2026.data.local.toEntity
import com.example.szigerinsider2026.data.local.toModel
import com.example.szigerinsider2026.data.config.FestivalConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import java.io.InputStreamReader
import java.net.URL

class LineupRepository(private val context: Context) : ILineupRepository {
    
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }
    private val database = AppDatabase.getDatabase(context)
    private val artistDao = database.artistDao()

    suspend fun getLineup(year: String = "2026"): List<Artist> = withContext(Dispatchers.IO) {
        // Try Room first
        val cached = artistDao.getArtistsByYear(year).first()
        if (cached.isNotEmpty()) {
            return@withContext cached.map { it.toModel() }
        }

        // Fallback to assets
        try {
            val inputStream = context.assets.open("lineup.json")
            val jsonString = InputStreamReader(inputStream).readText()
            val artists = json.decodeFromString<List<Artist>>(jsonString)
            
            // Seed Room
            artistDao.insertArtists(artists.map { it.toEntity(year) })
            
            artists
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun syncLineup(): Boolean = withContext(Dispatchers.IO) {
        val baseUrl = FestivalConfig.current.productionUrl ?: return@withContext false
        val syncUrl = "$baseUrl/data/lineup.json"
        
        try {
            val connection = URL(syncUrl).openConnection()
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            
            val jsonString = connection.getInputStream().bufferedReader().use { it.readText() }
            val artists = json.decodeFromString<List<Artist>>(jsonString)
            
            if (artists.isNotEmpty()) {
                artistDao.deleteArtistsByYear("2026")
                artistDao.insertArtists(artists.map { it.toEntity("2026") })
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
