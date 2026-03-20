package com.example.szigerinsider2026.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.szigerinsider2026.data.model.AiRecommendationResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URL

class AiRecommendationRepository(private val context: Context) {

    companion object {
        private const val BASE_URL = "https://sziget-studio.vercel.app"
        private const val CACHE_PREFS = "ai_recommendations_cache"
        private const val CACHE_TTL_MS = 5 * 60 * 1000L // 5 minutes
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(CACHE_PREFS, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun getRecommendations(prompt: String): AiRecommendationResult? =
        withContext(Dispatchers.IO) {
            try {
                // Check cache first
                val cacheKey = "recommendations_${prompt.hashCode()}"
                val cached = getFromCache(cacheKey)
                if (cached != null) return@withContext cached

                // Fetch from API
                val url = "$BASE_URL/api/ai/recommend"
                val body = JSONObject().apply {
                    put("prompt", prompt)
                }.toString()

                val connection = URL(url).openConnection()
                connection.setRequestProperty("Content-Type", "application/json")
                connection.doOutput = true

                connection.outputStream.use { output ->
                    output.write(body.toByteArray())
                    output.flush()
                }

                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val result = json.decodeFromString<AiRecommendationResult>(response)

                // Cache the result
                saveToCache(cacheKey, response)

                result
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }

    private fun getFromCache(key: String): AiRecommendationResult? {
        return try {
            val cached = prefs.getString(key, null) ?: return null
            val timestamp = prefs.getLong("${key}_time", 0)

            // Check if cache is still valid
            if (System.currentTimeMillis() - timestamp > CACHE_TTL_MS) {
                prefs.edit().remove(key).remove("${key}_time").apply()
                return null
            }

            val json = Json { ignoreUnknownKeys = true }
            json.decodeFromString<AiRecommendationResult>(cached)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun saveToCache(key: String, value: String) {
        try {
            prefs.edit().apply {
                putString(key, value)
                putLong("${key}_time", System.currentTimeMillis())
                apply()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
