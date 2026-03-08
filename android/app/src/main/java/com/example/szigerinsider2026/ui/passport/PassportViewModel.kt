package com.example.szigerinsider2026.ui.passport

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.local.UserDao
import com.example.szigerinsider2026.data.local.UserProgress
import com.example.szigerinsider2026.data.model.Artist
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class PassportViewModel(private val userDao: UserDao) : ViewModel() {

    private val _userProgress = MutableStateFlow(UserProgress())
    val userProgress: StateFlow<UserProgress> = _userProgress.asStateFlow()

    private val _challenges = MutableStateFlow<List<Challenge>>(emptyList())
    val challenges: StateFlow<List<Challenge>> = _challenges.asStateFlow()

    init {
        viewModelScope.launch {
            userDao.getUserProgress().collectLatest { progress ->
                progress?.let {
                    _userProgress.value = it
                }
            }
        }
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
        }
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
