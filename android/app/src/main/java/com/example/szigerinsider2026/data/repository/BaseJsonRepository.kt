package com.example.szigerinsider2026.data.repository

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.KSerializer
import java.io.InputStreamReader

abstract class BaseJsonRepository<T>(
    protected val context: Context,
    private val fileName: String,
    private val serializer: KSerializer<T>
) {
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun loadData(fallback: T): T = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.assets.open(fileName)
            val jsonString = InputStreamReader(inputStream).readText()
            json.decodeFromString(serializer, jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            fallback
        }
    }
}
