package com.example.szigerinsider2026.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Base64
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.model.SpotifyTokens
import com.example.szigerinsider2026.data.model.SpotifyTrackPage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URL
import java.net.URLEncoder
import java.security.MessageDigest
import java.util.*

import com.example.szigerinsider2026.data.config.FestivalConfig

class SpotifyRepository(private val context: Context) {

    private val REDIRECT_URI = "${FestivalConfig.DEEP_LINK_SCHEME}://spotify-callback"

    companion object {
        private const val CLIENT_ID = "d27e168c2c3746f7a22c075ce1a49dc2"
        private const val SCOPES = "user-library-read"
        private const val PREFS_NAME = "spotify_prefs"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_EXPIRES_AT = "expires_at"
        private const val ACCOUNTS_URL = "https://accounts.spotify.com"
        private const val API_URL = "https://api.spotify.com/v1"
    }

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    // PKCE helpers
    fun generateCodeVerifier(): String {
        val charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
        val random = Random()
        return (1..128)
            .map { charPool[random.nextInt(charPool.length)] }
            .joinToString("")
    }

    fun generateCodeChallenge(verifier: String): String {
        val bytes = verifier.toByteArray(Charsets.UTF_8)
        val digest = MessageDigest.getInstance("SHA-256").digest(bytes)
        // Android's Base64 uses URL_SAFE flag without padding
        return Base64.encodeToString(digest, Base64.URL_SAFE or Base64.NO_PADDING)
    }

    fun buildAuthUrl(codeChallenge: String): String {
        val params = mapOf(
            "client_id" to CLIENT_ID,
            "response_type" to "code",
            "redirect_uri" to REDIRECT_URI,
            "scope" to SCOPES,
            "code_challenge_method" to "S256",
            "code_challenge" to codeChallenge,
            "show_dialog" to "true"
        )
        val queryString = params
            .map { (k, v) -> "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}" }
            .joinToString("&")
        return "$ACCOUNTS_URL/authorize?$queryString"
    }

    suspend fun exchangeCode(code: String, codeVerifier: String): SpotifyTokens? =
        withContext(Dispatchers.IO) {
            try {
                val url = "$ACCOUNTS_URL/api/token"
                val body = mapOf(
                    "grant_type" to "authorization_code",
                    "code" to code,
                    "redirect_uri" to REDIRECT_URI,
                    "client_id" to CLIENT_ID,
                    "code_verifier" to codeVerifier
                )
                val queryString = body
                    .map { (k, v) -> "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}" }
                    .joinToString("&")

                val connection = URL(url).openConnection()
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
                connection.doOutput = true

                connection.outputStream.use { output ->
                    output.write(queryString.toByteArray())
                    output.flush()
                }

                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val tokens = json.decodeFromString<SpotifyTokens>(response)

                // Store tokens
                saveTokens(tokens)
                tokens
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }

    suspend fun getMatchedArtistIds(lineup: List<Artist>): Set<String> =
        withContext(Dispatchers.IO) {
            try {
                val token = getValidAccessToken() ?: return@withContext emptySet()
                val spotifyIds = mutableSetOf<String>()
                var nextUrl: String? = "$API_URL/me/tracks?limit=50"

                while (nextUrl != null && spotifyIds.size < 10000) {
                    val connection = URL(nextUrl).openConnection()
                    connection.setRequestProperty("Authorization", "Bearer $token")

                    try {
                        val response = connection.inputStream.bufferedReader().use { it.readText() }
                        val trackPage = json.decodeFromString<SpotifyTrackPage>(response)

                        trackPage.items.forEach { item ->
                            item.track.artists.forEach { artist ->
                                spotifyIds.add(artist.id)
                            }
                        }

                        nextUrl = trackPage.next
                    } catch (e: Exception) {
                        e.printStackTrace()
                        nextUrl = null
                    }
                }

                // Cross-reference with lineup
                val lineupSpotifyIds = lineup.mapNotNull { it.spotifyId }.toSet()
                spotifyIds.intersect(lineupSpotifyIds)
            } catch (e: Exception) {
                e.printStackTrace()
                emptySet()
            }
        }

    private suspend fun getValidAccessToken(): String? =
        withContext(Dispatchers.IO) {
            val token = prefs.getString(KEY_ACCESS_TOKEN, null)
            val expiresAt = prefs.getLong(KEY_EXPIRES_AT, 0)

            return@withContext when {
                token == null -> null
                System.currentTimeMillis() < expiresAt -> token
                else -> {
                    val refreshToken = prefs.getString(KEY_REFRESH_TOKEN, null)
                    if (refreshToken != null) refreshAccessToken(refreshToken) else null
                }
            }
        }

    private suspend fun refreshAccessToken(refreshToken: String): String? =
        withContext(Dispatchers.IO) {
            try {
                val url = "$ACCOUNTS_URL/api/token"
                val body = mapOf(
                    "grant_type" to "refresh_token",
                    "refresh_token" to refreshToken,
                    "client_id" to CLIENT_ID
                )
                val queryString = body
                    .map { (k, v) -> "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}" }
                    .joinToString("&")

                val connection = URL(url).openConnection()
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
                connection.doOutput = true

                connection.outputStream.use { output ->
                    output.write(queryString.toByteArray())
                    output.flush()
                }

                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val tokens = json.decodeFromString<SpotifyTokens>(response)
                saveTokens(tokens)
                tokens.accessToken
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }

    private fun saveTokens(tokens: SpotifyTokens) {
        prefs.edit().apply {
            putString(KEY_ACCESS_TOKEN, tokens.accessToken)
            tokens.refreshToken?.let { putString(KEY_REFRESH_TOKEN, it) }
            putLong(KEY_EXPIRES_AT, tokens.expiresAt)
            apply()
        }
    }

    fun isConnected(): Boolean {
        return prefs.getString(KEY_ACCESS_TOKEN, null) != null
    }

    fun disconnect() {
        prefs.edit().clear().apply()
    }
}
