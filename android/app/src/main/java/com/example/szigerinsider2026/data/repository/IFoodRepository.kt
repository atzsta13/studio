package com.example.szigerinsider2026.data.repository

import com.example.szigerinsider2026.data.model.FoodVendor

interface IFoodRepository {
    suspend fun getFoodVendors(): List<FoodVendor>
}
