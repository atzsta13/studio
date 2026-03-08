package com.example.szigerinsider2026.ui.passport

import com.example.szigerinsider2026.data.local.FavoriteArtist
import com.example.szigerinsider2026.data.model.Artist

private val DAY_ORDER = listOf(
    "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday"
)

data class Challenge(
    val id: String,
    val title: String,
    val description: String,
    val xpReward: Int,
    val icon: String,
    val isCompleted: Boolean = false
)

object ChallengeEngine {
    fun evaluate(
        favorites: List<FavoriteArtist>,
        allArtists: List<Artist>,
        completedIds: Set<String>,
        quizCompleted: Boolean
    ): List<Challenge> {
        val favArtistIds = favorites.map { it.artistId }.toSet()
        val favArtists = allArtists.filter { it.id in favArtistIds }
        val favGenres = favArtists.flatMap { it.genres }.toSet()
        val favCountries = favArtists.mapNotNull { it.countryCode }.toSet()
        val favVibeGroups = favArtists.flatMap { it.vibes }.groupingBy { it }.eachCount()

        val challenges = listOf(
            Challenge(
                "first_fav", "FIRST LOVE", "Favorite any artist", 50, "⭐",
                favorites.isNotEmpty()
            ),
            Challenge(
                "genre_explorer", "GENRE TOURIST", "Favorite artists from 3 different genres", 75, "🎸",
                favGenres.size >= 3
            ),
            Challenge(
                "globe_trotter", "GLOBE TROTTER", "Favorite artists from 5 different countries", 100, "🌍",
                favCountries.size >= 5
            ),
            Challenge(
                "headliner_fan", "HEADLINE HUNTER", "Favorite all 6 headliners", 150, "👑",
                favArtists.count { it.isHeadliner } >= 6
            ),
            Challenge(
                "vibe_curator", "VIBE CURATOR", "Favorite 3 artists sharing the same vibe", 75, "🔮",
                favVibeGroups.values.any { it >= 3 }
            ),
            Challenge(
                "quiz_done", "DNA DECODED", "Complete the Vibe DNA Quiz", 50, "🧬",
                quizCompleted
            ),
            Challenge(
                "full_week", "FULL WEEK WARRIOR", "Have at least 1 favorite for every festival day", 200, "📅",
                DAY_ORDER.all { day -> favArtists.any { it.day == day } }
            )
        )

        // Mark already-completed challenges (from persisted set) as complete regardless
        return challenges.map { c ->
            if (c.id in completedIds) c.copy(isCompleted = true) else c
        }
    }
}
