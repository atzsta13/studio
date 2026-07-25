package org.openfestivalhub.data.repository

import android.content.Context
import org.openfestivalhub.data.model.GuideData

import kotlinx.serialization.builtins.nullable

class GuideRepository(context: Context) : BaseJsonRepository<GuideData?>(
    context, 
    "guide.json", 
    GuideData.serializer().nullable
) {
    suspend fun getGuideData(): GuideData? = loadData(null)
}
