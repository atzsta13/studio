package org.openfestivalhub.data.repository

import android.content.Context
import org.openfestivalhub.data.model.Artist
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class LineupDiffRepository(private val context: Context) {

    data class LineupDiff(
        val newArtists: List<Artist>,
        val returningArtists: List<Artist>,
        val genreShifts: List<Pair<String, Int>>  // genre → delta (positive = more, negative = less)
    )

    suspend fun computeDiff(): LineupDiff = withContext(Dispatchers.IO) {
        val repo = LineupRepository(context)
        val artists2026 = repo.getLineup("2026")
        val artists2025 = repo.getLineup("2025")

        val names2026 = artists2026.map { it.artist.trim().lowercase() }.toSet()
        val names2025 = artists2025.map { it.artist.trim().lowercase() }.toSet()

        val newArtists = artists2026.filter { it.artist.trim().lowercase() !in names2025 }
        val returning = artists2026.filter { it.artist.trim().lowercase() in names2025 }

        // Genre delta
        fun genreCount(list: List<Artist>) =
            list.flatMap { it.genres }.groupingBy { it }.eachCount()

        val g26 = genreCount(artists2026)
        val g25 = genreCount(artists2025)
        val allGenres = (g26.keys + g25.keys).toSet()
        val shifts = allGenres
            .map { genre -> Pair(genre, (g26[genre] ?: 0) - (g25[genre] ?: 0)) }
            .filter { it.second != 0 }
            .sortedByDescending { kotlin.math.abs(it.second) }
            .take(8)

        LineupDiff(newArtists, returning, shifts)
    }
}
