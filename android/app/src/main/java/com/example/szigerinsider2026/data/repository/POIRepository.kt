package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.POI
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.io.InputStreamReader

class POIRepository(private val context: Context) {
    
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun getPOIs(): List<POI> = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.assets.open("poi.json")
            val jsonString = InputStreamReader(inputStream).readText()
            json.decodeFromString<List<POI>>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }
}
