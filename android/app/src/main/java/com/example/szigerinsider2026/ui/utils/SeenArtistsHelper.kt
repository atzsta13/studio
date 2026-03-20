package com.example.szigerinsider2026.ui.utils

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private const val PREFS_NAME = "sziget_seen"
private const val KEY_SEEN_IDS = "seen_artist_ids"

private val json = Json { ignoreUnknownKeys = true }

fun getSeenArtistIds(context: Context): Set<String> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_SEEN_IDS, null) ?: return emptySet()
    return runCatching {
        json.decodeFromString<List<String>>(raw).toSet()
    }.getOrDefault(emptySet())
}

/**
 * Toggles the seen state for [artistId].
 * Returns `true` if the artist is now marked as seen, `false` if unmarked.
 */
fun toggleSeenArtist(context: Context, artistId: String): Boolean {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val current = getSeenArtistIds(context).toMutableSet()
    val nowSeen = if (current.contains(artistId)) {
        current.remove(artistId)
        false
    } else {
        current.add(artistId)
        true
    }
    prefs.edit()
        .putString(KEY_SEEN_IDS, json.encodeToString(current.toList()))
        .apply()
    return nowSeen
}
