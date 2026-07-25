package org.openfestivalhub.data.repository

import android.content.Context
import org.openfestivalhub.data.model.Artist
import org.openfestivalhub.data.local.AppDatabase
import org.openfestivalhub.data.local.toEntity
import org.openfestivalhub.data.local.toModel
import org.openfestivalhub.data.config.FestivalConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import java.io.InputStreamReader

class LineupRepository(private val context: Context) : ILineupRepository {
    
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }
    private val database = AppDatabase.getDatabase(context)
    private val artistDao = database.artistDao()

    override suspend fun getLineup(year: String): List<Artist> = withContext(Dispatchers.IO) {
        // Try Room first
        val cached = artistDao.getArtistsByYear(year).first()
        if (cached.isNotEmpty()) {
            return@withContext cached.map { it.toModel() }
        }

        // Fallback to assets
        try {
            val inputStream = context.assets.open("${FestivalConfig.current.id}/lineup.json")
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
}
