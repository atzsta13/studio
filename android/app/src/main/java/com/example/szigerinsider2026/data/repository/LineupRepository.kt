package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.Artist
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import java.io.InputStreamReader

class LineupRepository(private val context: Context) {
    
    // Configured Json to ignore any unknown keys just in case
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun getLineup(year: String = "2026"): List<Artist> = withContext(Dispatchers.IO) {
        val fileName = if (year == "2025") "lineup_2025.json" else "lineup.json"
        
        try {
            val inputStream = context.assets.open(fileName)
            val jsonString = InputStreamReader(inputStream).readText()
            json.decodeFromString<List<Artist>>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }
}
