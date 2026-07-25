package org.openfestivalhub.data.repository

import org.openfestivalhub.data.model.Artist

interface ILineupRepository {
    suspend fun getLineup(year: String = "2026"): List<Artist>
}
