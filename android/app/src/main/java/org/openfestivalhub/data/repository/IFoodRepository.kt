package org.openfestivalhub.data.repository

import org.openfestivalhub.data.model.FoodVendor

interface IFoodRepository {
    suspend fun getFoodVendors(): List<FoodVendor>
}
