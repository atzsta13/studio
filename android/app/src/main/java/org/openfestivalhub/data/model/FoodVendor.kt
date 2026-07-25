package org.openfestivalhub.data.model

import kotlinx.serialization.Serializable

@Serializable
data class FoodVendor(
    val id: String,
    val name: String,
    val category: String,
    val cuisine: String? = null,
    val tags: List<String> = emptyList(),
    val priceRange: String? = null,
    val location: String? = null,
    val description: String? = null,
    val budgetOption: String? = null,
    val budgetPrice: String? = null,
    val mapCoords: MapCoords? = null
)
