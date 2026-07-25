package org.openfestivalhub.data.repository

import org.openfestivalhub.data.model.POI

interface IPOIRepository {
    suspend fun getPOIs(): List<POI>
}
