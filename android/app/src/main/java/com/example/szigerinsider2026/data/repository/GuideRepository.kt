package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.GuideData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import java.io.InputStreamReader

class GuideRepository(private val context: Context) {
    
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun getGuideData(): GuideData? = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.assets.open("guide.json")
            val jsonString = InputStreamReader(inputStream).readText()
            json.decodeFromString<GuideData>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
