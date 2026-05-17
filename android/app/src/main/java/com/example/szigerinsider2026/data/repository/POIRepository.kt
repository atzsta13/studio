package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.POI
import kotlinx.serialization.builtins.ListSerializer

class POIRepository(context: Context) : BaseJsonRepository<List<POI>>(
    context,
    "poi.json",
    ListSerializer(POI.serializer())
), IPOIRepository {
    override suspend fun getPOIs(): List<POI> = loadData(emptyList())
}
