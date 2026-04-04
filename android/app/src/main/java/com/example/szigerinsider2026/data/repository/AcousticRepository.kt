package com.example.szigerinsider2026.data.repository

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlin.math.log10
import kotlin.math.sqrt

class AcousticRepository(private val context: Context) {

    private val sampleRate = 44100
    private val channelConfig = AudioFormat.CHANNEL_IN_MONO
    private val audioFormat = AudioFormat.ENCODING_PCM_16BIT
    private val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

    /**
     * Captures a short burst of audio and returns a "Vibe Signature" description.
     * In a real implementation, this would compute an FFT or use a Conformer encoder.
     */
    @SuppressLint("MissingPermission")
    suspend fun captureAcousticSignature(durationMs: Long = 3000): String = withContext(Dispatchers.IO) {
        val audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            audioFormat,
            bufferSize
        )

        val buffer = ShortArray(bufferSize)
        audioRecord.startRecording()

        var maxAmplitude = 0f
        val startTime = System.currentTimeMillis()
        
        // Simple analysis loop: detect volume and "busyness"
        while (System.currentTimeMillis() - startTime < durationMs) {
            val read = audioRecord.read(buffer, 0, buffer.size)
            for (i in 0 until read) {
                val abs = Math.abs(buffer[i].toInt()).toFloat()
                if (abs > maxAmplitude) maxAmplitude = abs
            }
            delay(100)
        }

        audioRecord.stop()
        audioRecord.release()

        // Map amplitude to a descriptive string for the LLM
        val db = 20 * log10(maxAmplitude / 32768.0).coerceAtLeast(-100.0)
        
        return@withContext when {
            db > -10 -> "Extremely loud, distorted industrial energy. High-frequency percussion and heavy low-end sub-bass."
            db > -30 -> "Driving electronic rhythm with melodic synth layers. Moderate tempo, energetic atmosphere."
            db > -50 -> "Ambient melodic sounds, possibly acoustic or chill electronic. Intimate volume level."
            else -> "Quiet background noise or distant music."
        }
    }
}
