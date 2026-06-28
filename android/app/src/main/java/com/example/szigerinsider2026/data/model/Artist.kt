package com.example.szigerinsider2026.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Artist(
    val id: String,
    val artist: String,
    val stage: String? = null,
    val day: String? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val countryCode: String? = null,
    val genres: List<String> = emptyList(),
    val festivalUrl: String? = null,
    val socials: Socials? = null,
    val description: String? = null,
    val imageUrl: String? = null,
    val vibes: List<String> = emptyList(),
    val isHeadliner: Boolean = false,
    val returningHero: Boolean = false,
    val lastYearStage: String? = null,
    val timeSlot: String? = null,
    val showInSchedule: Boolean = true
) {
    val spotifyId: String?
        get() = socials?.spotify
            ?.split("/artist/")?.getOrNull(1)
            ?.split("?")?.firstOrNull()
}

@Serializable
data class Socials(
    val website: String? = null,
    val facebook: String? = null,
    val instagram: String? = null,
    val twitter: String? = null,
    val x: String? = null,
    val tiktok: String? = null,
    val youtube: String? = null,
    val spotify: String? = null,
    val appleMusic: String? = null,
    val soundcloud: String? = null
)
