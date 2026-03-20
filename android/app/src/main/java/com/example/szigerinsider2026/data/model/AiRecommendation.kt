package com.example.szigerinsider2026.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AiRecommendation(
    val artistId: String,
    val reason: String
)

@Serializable
data class AiRecommendationResult(
    val recommendations: List<AiRecommendation>,
    val scoutMessage: String
)
