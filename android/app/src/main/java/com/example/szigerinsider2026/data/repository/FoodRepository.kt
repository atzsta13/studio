package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.FoodVendor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import java.io.InputStreamReader

class FoodRepository(private val context: Context) {
    
    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }

    suspend fun getFoodVendors(): List<FoodVendor> = withContext(Dispatchers.IO) {
        try {
            val inputStream = context.assets.open("food.json")
            val jsonString = InputStreamReader(inputStream).readText()
            json.decodeFromString<List<FoodVendor>>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun getVendorsByCategory(category: String): List<FoodVendor> {
        return getFoodVendors().filter { it.category.equals(category, ignoreCase = true) }
    }
}
