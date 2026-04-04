package com.example.szigerinsider2026.data.repository

import android.content.Context
import com.example.szigerinsider2026.data.model.AiRecommendationResult
import com.example.szigerinsider2026.data.model.Artist
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
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

    /**
     * Downloads the Gemma 4 model from the production server.
     * In a real 2026 app, this would be a multi-part background download.
     */
    suspend fun downloadModel(modelUrl: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val url = URL(modelUrl)
            val connection = url.openConnection()
            connection.connect()
            
            val totalSize = connection.contentLength
            val inputStream = connection.getInputStream()
            val outputStream = modelFile.outputStream()
            
            val buffer = ByteArray(1024 * 1024) // 1MB buffer
            var bytesRead: Int
            var totalBytesRead = 0L
            
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                totalBytesRead += bytesRead
                _downloadProgress.value = totalBytesRead.toFloat() / totalSize.toFloat()
            }
            
            outputStream.close()
            inputStream.close()
            _isModelDownloaded.value = true
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Initializes the LLM with the local model file.
     */
    fun initializeLlm() {
        if (!modelFile.exists()) return
        
        val options = LlmInference.LlmInferenceOptions.builder()
            .setModelPath(modelFile.absolutePath)
            .setMaxTokens(512)
            .setTopK(40)
            .setTemperature(0.7f)
            .build()
            
        llmInference = LlmInference.createFromOptions(context, options)
    }

    /**
     * Performs local inference to find artists.
     */
    suspend fun getLocalRecommendations(prompt: String, artists: List<Artist>): String = withContext(Dispatchers.Default) {
        val llm = llmInference ?: return@withContext "AI Scout is not ready yet."
        
        // Build context from lineup (RAG-lite)
        val artistsContext = artists.joinToString("\n") { 
            "- ${it.artist} (${it.genres.joinToString()}): ${it.description?.take(100)}..."
        }
        
        val fullPrompt = """
            You are the Festival Scout. Based on the following artist list, recommend the best matches for the user's request.
            Be concise and high-energy.
            
            LINEUP:
            $artistsContext
            
            USER REQUEST:
            $prompt
            
            SCOUT RECOMMENDATION:
        """.trimIndent()
        
        try {
            llm.generateResponse(fullPrompt)
        } catch (e: Exception) {
            "The Scout encountered an error: ${e.message}"
        }
    }
}
