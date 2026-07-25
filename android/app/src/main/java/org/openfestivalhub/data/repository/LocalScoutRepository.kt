package org.openfestivalhub.data.repository

import android.content.Context
import org.openfestivalhub.data.model.Artist
import com.google.mlkit.genai.common.DownloadStatus
import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.prompt.Generation
import com.google.mlkit.genai.prompt.GenerativeModel
import com.google.mlkit.genai.prompt.TextPart
import com.google.mlkit.genai.prompt.generateContentRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LocalScoutRepository(private val context: Context) {

    private val generativeModel: GenerativeModel = Generation.getClient()
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _isModelDownloaded = MutableStateFlow(false)
    val isModelDownloaded = _isModelDownloaded.asStateFlow()

    private val _downloadProgress = MutableStateFlow(0f)
    val downloadProgress = _downloadProgress.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    init {
        scope.launch {
            checkModelStatus()
        }
    }

    private suspend fun checkModelStatus() {
        try {
            val status = generativeModel.checkStatus()
            _isModelDownloaded.value = (status == FeatureStatus.AVAILABLE)
            if (status == FeatureStatus.UNAVAILABLE) {
                _error.value = "Gemini Nano is not supported on this device."
            }
        } catch (e: Exception) {
            _error.value = "Status check failed: ${e.localizedMessage}"
        }
    }

    /**
     * Triggers the system download for Gemini Nano via AICore.
     */
    suspend fun downloadModel(modelUrl: String? = null): Boolean = withContext(Dispatchers.IO) {
        try {
            _error.value = null
            val status = generativeModel.checkStatus()
            
            if (status == FeatureStatus.AVAILABLE) {
                _isModelDownloaded.value = true
                return@withContext true
            }

            if (status == FeatureStatus.UNAVAILABLE) {
                _error.value = "Gemini Nano is not supported on this device."
                return@withContext false
            }

            var success = false
            var totalBytes: Long = 0
            generativeModel.download().collect { downloadStatus ->
                when (downloadStatus) {
                    is DownloadStatus.DownloadStarted -> {
                        totalBytes = downloadStatus.bytesToDownload
                        _downloadProgress.value = 0.01f
                    }
                    is DownloadStatus.DownloadProgress -> {
                        if (totalBytes > 0) {
                            _downloadProgress.value = downloadStatus.totalBytesDownloaded.toFloat() / totalBytes.toFloat()
                        }
                    }
                    is DownloadStatus.DownloadCompleted -> {
                        _isModelDownloaded.value = true
                        _downloadProgress.value = 1f
                        success = true
                    }
                    is DownloadStatus.DownloadFailed -> {
                        _error.value = "Download failed"
                    }
                }
            }
            success
        } catch (e: Exception) {
            e.printStackTrace()
            _error.value = "Download trigger failed: ${e.localizedMessage}"
            false
        }
    }

    fun scanForLocalModel() {
        scope.launch {
            checkModelStatus()
        }
    }

    fun initializeLlm() {
        scope.launch {
            checkModelStatus()
        }
    }

    /**
     * Runs local inference to recommend acts, emitting the response in chunks.
     */
    fun getLocalRecommendationsStreaming(
        query: String,
        artists: List<Artist>,
        persona: String
    ): Flow<String> = callbackFlow {
        if (!_isModelDownloaded.value) {
            trySend("AI Scout is not ready yet.")
            close()
            return@callbackFlow
        }

        val prompt = buildScoutPrompt(persona, query, selectCandidates(query, artists))
        // Passing the prompt directly if the builder supports it, or using TextPart
        val request = generateContentRequest(TextPart(prompt)) { }

        try {
            generativeModel.generateContentStream(request).collect { response ->
                // Try to get text from the first candidate
                val text = response.candidates.firstOrNull()?.text ?: ""
                trySend(text)
            }
        } catch (e: Exception) {
            trySend("The Scout is confused: ${e.message}")
        }
        close()
    }

    private fun selectCandidates(query: String, artists: List<Artist>): List<Artist> {
        val terms = query.lowercase()
            .split(Regex("[^a-z0-9]+"))
            .filter { it.length > 2 }
            .toSet()

        if (terms.isEmpty()) {
            return artists.sortedByDescending { it.isHeadliner }.take(MAX_CANDIDATES)
        }

        val matched = artists
            .map { artist ->
                val haystack = (
                    artist.artist + " " +
                        artist.genres.joinToString(" ") + " " +
                        artist.vibes.joinToString(" ") + " " +
                        (artist.description ?: "")
                    ).lowercase()
                artist to terms.count { haystack.contains(it) }
            }
            .filter { it.second > 0 }
            .sortedByDescending { it.second }
            .map { it.first }

        return if (matched.isNotEmpty()) {
            matched.take(MAX_CANDIDATES)
        } else {
            artists.sortedByDescending { it.isHeadliner }.take(MAX_CANDIDATES)
        }
    }

    private fun buildScoutPrompt(persona: String, query: String, candidates: List<Artist>): String {
        val lineup = candidates.joinToString("\n") { artist ->
            val slot = listOfNotNull(
                artist.day,
                artist.startTime?.let(::formatClock),
                artist.stage
            ).joinToString(" · ")
            val genres = artist.genres.joinToString(", ").ifBlank { "—" }
            val where = if (slot.isBlank()) "" else " [$slot]"
            "- ${artist.artist}$where — $genres"
        }

        return """
            You are $persona
            Recommend acts from the lineup below that fit the user's request. Be concise and specific, and only mention acts that appear in the list. If asked who plays at a given time or stage, use the schedule shown in brackets.

            LINEUP (day · time · stage — genres):
            $lineup

            USER REQUEST:
            $query

            RECOMMENDATION:
        """.trimIndent()
    }

    private fun formatClock(iso: String): String? {
        val t = iso.indexOf('T')
        return if (t >= 0 && iso.length >= t + 6) iso.substring(t + 1, t + 6) else null
    }

    companion object {
        private const val MAX_CANDIDATES = 20
    }
}
