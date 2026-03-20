package com.example.szigerinsider2026.ui.passport

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.local.UserDao
import com.example.szigerinsider2026.data.local.UserProgress
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.ui.utils.getSeenArtistIds
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class AchievementBadge(
    val id: String,
    val title: String,
    val emoji: String,
    val description: String,
    val unlocked: Boolean
)

class PassportViewModel(
    private val userDao: UserDao,
    private val context: Context
) : ViewModel() {

    private val _userProgress = MutableStateFlow(UserProgress())
    val userProgress: StateFlow<UserProgress> = _userProgress.asStateFlow()

    private val _challenges = MutableStateFlow<List<Challenge>>(emptyList())
    val challenges: StateFlow<List<Challenge>> = _challenges.asStateFlow()

    private val _achievements = MutableStateFlow<List<AchievementBadge>>(emptyList())
    val achievements: StateFlow<List<AchievementBadge>> = _achievements.asStateFlow()

    private val _actsSeen = MutableStateFlow(0)
    val actsSeen: StateFlow<Int> = _actsSeen.asStateFlow()

    init {
        viewModelScope.launch {
            userDao.getUserProgress().collectLatest { progress ->
                progress?.let {
                    _userProgress.value = it
                }
            }
        }
        // Read seen count once on init (SharedPreferences, no coroutine needed)
        _actsSeen.value = getSeenArtistIds(context).size
    }

    fun toggleStamp(stampId: String) {
        viewModelScope.launch {
            val current = _userProgress.value
            val currentStamps = current.stampsCollected.toMutableList()

            if (currentStamps.contains(stampId)) {
                currentStamps.remove(stampId)
            } else {
                currentStamps.add(stampId)
            }

            val newXp = currentStamps.size * 50
            val newRank = calculateRankFromXp(newXp)

            val updatedProgress = current.copy(
                stampsCollected = currentStamps,
                legendXp = newXp,
                currentRank = newRank
            )

            userDao.insertUserProgress(updatedProgress)
        }
    }

    fun evaluateChallenges(allArtists: List<Artist>) {
        viewModelScope.launch {
            val progress = userDao.getUserProgress().first() ?: return@launch
            val favs = userDao.getAllFavorites().first()
            val completedIds = if (progress.completedChallengeIds.isBlank()) emptySet()
                else progress.completedChallengeIds.split(",").toSet()
            val evaluated = ChallengeEngine.evaluate(favs, allArtists, completedIds, progress.quizCompleted)

            // Award XP for newly completed challenges
            val newlyDone = evaluated.filter { it.isCompleted && it.id !in completedIds }
            if (newlyDone.isNotEmpty()) {
                val xpGain = newlyDone.sumOf { it.xpReward }
                val newXp = progress.legendXp + xpGain
                val newCompleted = (completedIds + newlyDone.map { it.id }).joinToString(",")
                userDao.updateXP(newXp)
                userDao.updateCompletedChallenges(newCompleted)
            }
            _challenges.value = evaluated

            // Compute achievement badges
            computeAchievements(favs.map { it.artistId }.toSet(), allArtists)
        }
    }

    private fun computeAchievements(favArtistIds: Set<String>, allArtists: List<Artist>) {
        val favArtists = allArtists.filter { it.id in favArtistIds }
        val seenIds = getSeenArtistIds(context)
        _actsSeen.value = seenIds.size

        val loyalFan = favArtists.size >= 5
        val worldCitizen = favArtists.mapNotNull { it.countryCode }.toSet().size >= 5
        val genreExplorer = favArtists.flatMap { it.genres }.toSet().size >= 5
        val headlinerHunter = favArtists.count { it.isHeadliner } >= 3
        val vibeHunter = favArtists.flatMap { it.vibes }.toSet().size >= 10
        val actsSeen = seenIds.size >= 3

        _achievements.value = listOf(
            AchievementBadge(
                id = "loyal_fan",
                title = "LOYAL FAN",
                emoji = "🎵",
                description = "Favorite 5+ artists",
                unlocked = loyalFan
            ),
            AchievementBadge(
                id = "world_citizen",
                title = "WORLD CITIZEN",
                emoji = "🌍",
                description = "Favorites from 5+ countries",
                unlocked = worldCitizen
            ),
            AchievementBadge(
                id = "genre_explorer",
                title = "GENRE EXPLORER",
                emoji = "🎭",
                description = "Favorites span 5+ genres",
                unlocked = genreExplorer
            ),
            AchievementBadge(
                id = "headliner_hunter",
                title = "HEADLINER HUNTER",
                emoji = "⭐",
                description = "Favorite 3+ headliners",
                unlocked = headlinerHunter
            ),
            AchievementBadge(
                id = "vibe_hunter",
                title = "VIBE HUNTER",
                emoji = "✨",
                description = "10+ unique vibes in favorites",
                unlocked = vibeHunter
            ),
            AchievementBadge(
                id = "acts_seen",
                title = "ACTS SEEN",
                emoji = "👁",
                description = "Mark 3+ sets as seen",
                unlocked = actsSeen
            )
        )
    }

    private fun calculateRankFromXp(xp: Int): String {
        return when {
            xp >= 2000 -> "Sziget Legend"
            xp >= 1000 -> "Main Stage Hero"
            xp >= 500 -> "Szitizen"
            xp >= 200 -> "Island Explorer"
            else -> "Tourist"
        }
    }
}
