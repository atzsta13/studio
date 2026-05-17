package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.FoodVendor
import kotlinx.serialization.builtins.ListSerializer

class FoodRepository(context: Context) : BaseJsonRepository<List<FoodVendor>>(
    context,
    "food.json",
    ListSerializer(FoodVendor.serializer())
), IFoodRepository {
    override suspend fun getFoodVendors(): List<FoodVendor> = loadData(emptyList())

    suspend fun getVendorsByCategory(category: String): List<FoodVendor> {
        return getFoodVendors().filter { it.category.equals(category, ignoreCase = true) }
    }
}
