package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.GuideData

import kotlinx.serialization.builtins.nullable

class GuideRepository(context: Context) : BaseJsonRepository<GuideData?>(
    context, 
    "guide.json", 
    GuideData.serializer().nullable
) {
    suspend fun getGuideData(): GuideData? = loadData(null)
}
