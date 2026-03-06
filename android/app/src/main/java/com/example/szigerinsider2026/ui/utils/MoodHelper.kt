package com.example.szigerinsider2026.ui.utils

import androidx.compose.ui.graphics.Color
import com.example.szigerinsider2026.data.model.Artist

data class Mood(val label: String, val color: Color, val emoji: String)

fun getMood(artist: Artist): Mood {
    val vibes = artist.vibes
    val genres = artist.genres

    val euphoricVibes = listOf("High Energy", "Anthemic", "Festival", "Dance")
    val euphoricGenres = listOf("POP", "DANCE")
    val isEuphoric = vibes.any { vibe -> euphoricVibes.any { vibe.contains(it, ignoreCase = true) } } ||
            genres.any { genre -> euphoricGenres.any { genre.contains(it, ignoreCase = true) } }

    val chillVibes = listOf("Mellow", "Atmospheric", "Dreamy", "Ambient", "Lo-fi")
    val chillGenres = listOf("AMBIENT", "JAZZ", "FOLK")
    val isChill = vibes.any { vibe -> chillVibes.any { vibe.contains(it, ignoreCase = true) } } ||
            genres.any { genre -> chillGenres.any { genre.contains(it, ignoreCase = true) } }

    val intenseVibes = listOf("Heavy", "Dark", "Raw", "Aggressive")
    val intenseGenres = listOf("METAL", "HARDCORE", "PUNK", "INDUSTRIAL")
    val isIntense = vibes.any { vibe -> intenseVibes.any { vibe.contains(it, ignoreCase = true) } } ||
            genres.any { genre -> intenseGenres.any { genre.contains(it, ignoreCase = true) } }

    val wildVibes = listOf("Chaotic", "Experimental", "Psychedelic")
    val wildGenres = listOf("EXPERIMENTAL", "PSYCHEDELIC")
    val isWild = vibes.any { vibe -> wildVibes.any { vibe.contains(it, ignoreCase = true) } } ||
            genres.any { genre -> wildGenres.any { genre.contains(it, ignoreCase = true) } }

    val emotionalVibes = listOf("Soulful", "Melancholic", "Passionate", "Emotional")
    val isEmotional = vibes.any { vibe -> emotionalVibes.any { vibe.contains(it, ignoreCase = true) } }

    return when {
        isEuphoric -> Mood(label = "EUPHORIC", color = Color(0xFFFFEE00), emoji = "⚡")
        isChill -> Mood(label = "CHILL", color = Color(0xFF00C3FF), emoji = "🌊")
        isIntense -> Mood(label = "INTENSE", color = Color(0xFFFF0080), emoji = "🔥")
        isWild -> Mood(label = "WILD", color = Color(0xFF4ADE80), emoji = "🌀")
        isEmotional -> Mood(label = "EMOTIONAL", color = Color(0xFF9B59B6), emoji = "💜")
        else -> Mood(label = "ELECTRIC", color = Color(0xFFFF0080), emoji = "✨")
    }
}
