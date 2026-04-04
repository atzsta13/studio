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
     * Captures a short burst of audio and returns a "Tactical Acoustic Signature".
     * Uses RMS for volume and Zero-Crossing for frequency/tempo estimation.
     */
    @SuppressLint("MissingPermission")
    suspend fun captureAcousticSignature(durationMs: Long = 4000): String = withContext(Dispatchers.IO) {
        val audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            channelConfig,
            audioFormat,
            bufferSize
        )

        if (audioRecord.state != AudioRecord.STATE_INITIALIZED) {
            return@withContext "Hardware initialization failed."
        }

        val buffer = ShortArray(bufferSize)
        audioRecord.startRecording()

        var sumSquare = 0.0
        var totalSamples = 0L
        var crossings = 0
        var lastValue = 0
        
        val startTime = System.currentTimeMillis()
        
        // High-performance capture loop
        while (System.currentTimeMillis() - startTime < durationMs) {
            val read = audioRecord.read(buffer, 0, buffer.size)
            if (read > 0) {
                for (i in 0 until read) {
                    val value = buffer[i].toInt()
                    
                    // RMS Calculation (Energy)
                    sumSquare += value * value
                    totalSamples++
                    
                    // Zero-Crossing Detection (Tempo/Frequency estimation)
                    if ((lastValue < 0 && value >= 0) || (lastValue >= 0 && value < 0)) {
                        crossings++
                    }
                    lastValue = value
                }
            }
            delay(10) // Yield to other tasks
        }

        audioRecord.stop()
        audioRecord.release()

        if (totalSamples == 0L) return@withContext "No acoustic data captured."

        // 1. Calculate Decibel Level (Volume)
        val rms = sqrt(sumSquare / totalSamples)
        val db = 20 * log10(rms / 32768.0).coerceAtLeast(-100.0)
        
        // 2. Calculate Crossings Rate (Frequency estimation)
        // High rate = high frequency / fast tempo (Techno/Metal)
        // Low rate = low frequency / slow tempo (Chill/Ambient)
        val crossingRate = crossings.toDouble() / (durationMs / 1000.0)

        // Map data to a descriptive prompt for Gemma 4
        return@withContext buildSignaturePrompt(db, crossingRate)
    }

    private fun buildSignaturePrompt(db: Double, crossingRate: Double): String {
        val volumeDesc = when {
            db > -15 -> "extremely loud and intense"
            db > -35 -> "moderate volume"
            else -> "relatively quiet"
        }

        val energyDesc = when {
            crossingRate > 8000 -> "very high energy, fast-paced rhythm, possibly techno or aggressive electronic"
            crossingRate > 4000 -> "energetic and rhythmic, likely pop, rock, or house music"
            else -> "slow-paced, melodic, or atmospheric"
        }

        return "I am currently at a stage where the music is $volumeDesc. The sound signature indicates a $energyDesc vibe. Based on the current lineup, which artist matches this acoustic profile?"
    }
}
