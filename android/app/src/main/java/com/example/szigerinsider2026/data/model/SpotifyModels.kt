package com.example.szigerinsider2026.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SpotifyTokens(
    @SerialName("access_token")
    val accessToken: String,
    @SerialName("refresh_token")
    val refreshToken: String? = null,
    @SerialName("expires_in")
    val expiresIn: Int,
    @SerialName("token_type")
    val tokenType: String = "Bearer"
) {
    val expiresAt: Long
        get() = System.currentTimeMillis() + (expiresIn * 1000)
}

@Serializable
data class SpotifyTrackPage(
    val items: List<SpotifyTrackItem>,
    val total: Int,
    val next: String? = null
)

@Serializable
data class SpotifyTrackItem(
    val track: SpotifyTrack
)

@Serializable
data class SpotifyTrack(
    val artists: List<SpotifyArtistRef>
)

@Serializable
data class SpotifyArtistRef(
    val id: String,
    val name: String
)
