package org.openfestivalhub.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MapCoords(
    val x: Int,
    val y: Int
)
