package com.example.szigerinsider2026.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_progress")
data class UserProgress(
    @PrimaryKey
    val id: Int = 1,
    val legendXp: Int = 0,
    val stampsCollected: List<String> = emptyList(),
    val currentRank: String = "Tourist",
    val completedChallengeIds: String = "",
    val quizCompleted: Boolean = false
)
