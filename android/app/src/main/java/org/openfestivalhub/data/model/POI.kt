package org.openfestivalhub.data.model

import kotlinx.serialization.Serializable

@Serializable
data class POI(
    val id: String,
    val name: String,
    val type: String,
    val location: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val mapCoords: MapCoords? = null
)
