package com.example.szigerinsider2026.ui.quiz

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.szigerinsider2026.data.model.Artist
import com.example.szigerinsider2026.data.repository.LineupRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class VibeQuizViewModel(private val repo: LineupRepository) : ViewModel() {

    var step by mutableStateOf(0)
    var energy by mutableStateOf("")
    var selectedGenres by mutableStateOf(setOf<String>())
    var crowdVibe by mutableStateOf("")
    var moodTag by mutableStateOf("")
    var wildcards by mutableStateOf(false)

    private val _results = MutableStateFlow<List<Artist>>(emptyList())
    val results: StateFlow<List<Artist>> = _results.asStateFlow()

    private val _allArtists = MutableStateFlow<List<Artist>>(emptyList())

    private val genreVibeHints = mapOf(
        "TECHNO" to listOf("Dance", "Hard", "Rave"),
        "ELECTRONIC" to listOf("Dance", "Flow"),
        "ROCK" to listOf("High Energy", "Anthemic"),
        "HIP-HOP" to listOf("Party", "Anthemic", "Sing-along"),
        "INDIE" to listOf("Feel-good", "Nostalgic"),
        "POP" to listOf("Sing-along", "Feel-good", "Party"),
        "METAL" to listOf("Hard", "High Energy"),
        "EXPERIMENTAL" to listOf("Flow", "Weird"),
        "AMBIENT" to listOf("Chill", "Flow"),
        "JAZZ" to listOf("Chill", "Flow"),
        "HOUSE" to listOf("Dance", "Feel-good", "Party"),
        "DRUM AND BASS" to listOf("Dance", "Hard", "High Energy"),
        "ALTERNATIVE" to listOf("Feel-good", "Anthemic"),
        "R&B" to listOf("Feel-good", "Party", "Sing-along"),
        "SOUL" to listOf("Feel-good", "Nostalgic", "Sing-along")
    )

    init {
        viewModelScope.launch {
            _allArtists.value = repo.getLineup()
        }
    }

    fun reset() {
        step = 0
        energy = ""
        selectedGenres = setOf()
        crowdVibe = ""
        moodTag = ""
        wildcards = false
        _results.value = emptyList()
    }

    fun computeResults() {
        val targetVibes = buildList {
            when (energy) {
                "CHILL" -> addAll(listOf("Chill", "Flow", "Nostalgic"))
                "UNHINGED" -> addAll(listOf("Hard", "Rave", "High Energy", "Dance"))
                else -> addAll(listOf("Dance", "Feel-good", "Party"))
            }
            when (moodTag) {
                "EUPHORIC" -> addAll(listOf("Feel-good", "Anthemic", "Sing-along", "Dance"))
                "DARK" -> addAll(listOf("Hard", "Rave", "Weird"))
                "NOSTALGIC" -> addAll(listOf("Nostalgic", "Anthemic", "Feel-good"))
                "FRESH" -> addAll(listOf("Flow", "Dance", "Party"))
                "HARD" -> addAll(listOf("Hard", "High Energy", "Rave"))
            }
        }.toSet()

        val all = _allArtists.value
        val scored = all.map { artist ->
            val genreScore = artist.genres.count { g ->
                selectedGenres.any { sel -> g.contains(sel, ignoreCase = true) }
            } * 2
            val vibeScore = artist.vibes.count { v ->
                targetVibes.any { t -> v.equals(t, ignoreCase = true) }
            }
            val headlinerBonus = if (artist.isHeadliner && !wildcards) 1 else 0
            val noise = if (wildcards) (0..100).random() / 100f else 0f
            Pair(artist, genreScore + vibeScore + headlinerBonus + noise)
        }

        val sorted = scored.sortedByDescending { it.second }
        val top = sorted.filter { it.second > 0 }.take(8).map { it.first }
        _results.value = if (top.size >= 4) top else sorted.take(4).map { it.first }
    }

    class Factory(private val repo: LineupRepository) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return VibeQuizViewModel(repo) as T
        }
    }
}
