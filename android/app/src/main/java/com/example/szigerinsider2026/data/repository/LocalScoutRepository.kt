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
    private val modelFile = File(context.filesDir, modelFileName)

    private val _isModelDownloaded = MutableStateFlow(modelFile.exists())
    val isModelDownloaded = _isModelDownloaded.asStateFlow()

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
            val outputStream = modelFile.outputStream()
            
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

    private fun hasEnoughSpace(requiredBytes: Long): Boolean {
        val stat = StatFs(context.filesDir.path)
        val availableBytes = stat.availableBlocksLong * stat.blockSizeLong
        return availableBytes >= requiredBytes
    }

    /**
     * Initializes the LLM with the local model file.
     */
    fun initializeLlm() {
        if (!modelFile.exists()) return
        
        try {
            val options = LlmInference.LlmInferenceOptions.builder()
                .setModelPath(modelFile.absolutePath)
                .setMaxTokens(512)
                .setTopK(40)
                .setTemperature(0.7f)
                .build()
                
            llmInference = LlmInference.createFromOptions(context, options)
        } catch (e: Exception) {
            _error.value = "AI Initialization failed: ${e.localizedMessage}"
        }
    }

    /**
     * Performs streaming local inference to find artists.
     * This provides a "typing" effect in the UI.
     */
    fun getLocalRecommendationsStreaming(prompt: String, artists: List<Artist>): Flow<String> = callbackFlow {
        val llm = llmInference
        if (llm == null) {
            trySend("AI Scout is not ready yet.")
            close()
            return@callbackFlow
        }
        
        // Context pruning (RAG-Lite)
        val artistsContext = artists.joinToString("\n") { 
            "- ${it.name} (${it.genres.joinToString()}): ${it.description?.take(120)}..."
        }
        
        val fullPrompt = """
            You are the high-energy Festival Scout. Recommend artists from the lineup based on the user's vibe request.
            Be concise, enthusiastic, and direct.
            
            LINEUP DATA:
            $artistsContext
            
            USER VIBE REQUEST:
            $prompt
            
            SCOUT RECOMMENDATION:
        """.trimIndent()
        
        try {
            val response = llm.generateResponse(fullPrompt)
            // Word-by-word emit to give a typing effect in the UI
            response.split(" ").forEach { word ->
                trySend("$word ")
                kotlinx.coroutines.delay(30)
            }
            close()
        } catch (e: Exception) {
            trySend("The Scout is confused: ${e.message}")
            close()
        }
        
        awaitClose { /* Cleanup if needed */ }
    }
}
