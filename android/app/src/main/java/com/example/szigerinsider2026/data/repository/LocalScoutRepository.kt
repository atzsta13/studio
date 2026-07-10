package com.example.szigerinsider2026.data.repository

import android.content.Context
import android.os.StatFs
import com.example.szigerinsider2026.data.model.Artist
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.net.URL

class LocalScoutRepository(private val context: Context) {

    private var llmInference: LlmInference? = null
    private val modelFileName = "gemma4-2b-android.bin"
    private val internalModelFile = File(context.filesDir, modelFileName)
    
    // Common tactical paths for pre-downloaded models
    private val externalPaths = listOf(
        "/data/local/tmp/llm/gemma4-2b-android.bin",
        "/data/local/tmp/llm/model.bin",
        File(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS), "gemma4-2b-android.bin").absolutePath,
        File(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS), "model.bin").absolutePath
    )

    private val _isModelDownloaded = MutableStateFlow(checkIfModelExists())
    val isModelDownloaded = _isModelDownloaded.asStateFlow()

    private fun checkIfModelExists(): Boolean {
        if (internalModelFile.exists()) return true
        return externalPaths.any { File(it).exists() }
    }

    private fun getAvailableModelPath(): String? {
        if (internalModelFile.exists()) return internalModelFile.absolutePath
        return externalPaths.find { File(it).exists() }
    }

    private val _downloadProgress = MutableStateFlow(0f)
    val downloadProgress = _downloadProgress.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    /**
     * Downloads the Gemma 4 model from the production server.
     */
    suspend fun downloadModel(modelUrl: String): Boolean = withContext(Dispatchers.IO) {
        try {
            _error.value = null
            
            // 1. Check if we already have it somewhere else first
            val existing = getAvailableModelPath()
            if (existing != null) {
                _isModelDownloaded.value = true
                return@withContext true
            }

            // 1. Check Disk Space (Gemma 4 is ~1.2GB, we want 2GB free for safety)
            if (!hasEnoughSpace(2000 * 1024 * 1024L)) {
                _error.value = "Not enough disk space (2GB required)."
                return@withContext false
            }

            val url = URL(modelUrl)
            val connection = url.openConnection()
            connection.connect()
            
            val totalSize = connection.contentLengthLong
            val inputStream = connection.getInputStream()
            val outputStream = internalModelFile.outputStream()
            
            val buffer = ByteArray(1024 * 1024) // 1MB buffer
            var bytesRead: Int
            var totalBytesRead = 0L
            
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                totalBytesRead += bytesRead
                if (totalSize > 0) {
                    _downloadProgress.value = totalBytesRead.toFloat() / totalSize.toFloat()
                } else {
                    // Fallback for unknown size: show something is happening
                    _downloadProgress.value = -1f 
                }
            }
            
            outputStream.close()
            inputStream.close()
            _isModelDownloaded.value = true
            true
        } catch (e: Exception) {
            e.printStackTrace()
            _error.value = "Download failed: ${e.localizedMessage}"
            false
        }
    }

    /**
     * Force a local file system check for the model.
     */
    fun scanForLocalModel() {
        val path = getAvailableModelPath()
        if (path != null) {
            _isModelDownloaded.value = true
            initializeLlm()
        } else {
            _error.value = "No local model found. Ensure model is at /data/local/tmp/llm/gemma4-2b-android.bin"
        }
    }

    private fun hasEnoughSpace(requiredBytes: Long): Boolean {
        val stat = StatFs(context.filesDir.path)
        val availableBytes = stat.availableBlocksLong * stat.blockSizeLong
        return availableBytes >= requiredBytes
    }

    /**
     * Initializes the LLM with the local model file.
     */
    fun initializeLlm() {
        val path = getAvailableModelPath() ?: return

        try {
            val options = LlmInference.LlmInferenceOptions.builder()
                .setModelPath(path)
                .setMaxTokens(2048)
                .setTopK(40)
                .setTemperature(0.7f)
                .build()

            llmInference = LlmInference.createFromOptions(context, options)
        } catch (e: Exception) {
            _error.value = "AI Initialization failed: ${e.localizedMessage}"
        }
    }

    /**
     * Runs local inference to recommend acts, emitting the response as a single
     * chunk. The lineup is pre-filtered to a bounded candidate set so the prompt
     * size stays flat no matter how large a festival is. [persona] is the
     * festival's configured aiPersona — the prompt is not hardcoded here.
     */
    fun getLocalRecommendationsStreaming(
        query: String,
        artists: List<Artist>,
        persona: String
    ): Flow<String> = callbackFlow {
        val llm = llmInference
        if (llm == null) {
            trySend("AI Scout is not ready yet.")
            close()
            return@callbackFlow
        }

        val prompt = buildScoutPrompt(persona, query, selectCandidates(query, artists))

        try {
            trySend(llm.generateResponse(prompt))
        } catch (e: Exception) {
            trySend("The Scout is confused: ${e.message}")
        }
        close()
        awaitClose { }
    }

    /**
     * Bounded retrieval: rank the lineup by query overlap (name / genre / vibe /
     * description) and keep the top [MAX_CANDIDATES]. Falls back to headliners
     * first when nothing matches, so the prompt is never the entire lineup.
     */
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

    /** Single source of truth for the Scout prompt. Includes schedule so the model can answer "who's playing when/where". */
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

    /** "2026-07-16T21:30:00+02:00" -> "21:30". Dependency-free, keeps this repo off the UI layer. */
    private fun formatClock(iso: String): String? {
        val t = iso.indexOf('T')
        return if (t >= 0 && iso.length >= t + 6) iso.substring(t + 1, t + 6) else null
    }

    companion object {
        private const val MAX_CANDIDATES = 20
    }
}
