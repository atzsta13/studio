package com.example.szigerinsider2026.ui.utils

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

class HapticManager(context: Context) {

    private val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

    /** Barely-there tap — navigation, chip selection, list items */
    fun lightTap() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
        } else {
            vibrator.vibrate(VibrationEffect.createOneShot(12, 80))
        }
    }

    /** Satisfying double-pulse — toggling a favorite on */
    fun favoriteTap() {
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 20, 35, 45),
                intArrayOf(0, 200, 0, 120),
                -1
            )
        )
    }

    /** Soft single pulse — deselecting, closing, removing */
    fun mediumTap() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK))
        } else {
            vibrator.vibrate(VibrationEffect.createOneShot(25, 160))
        }
    }

    /** Duolingo-style ascending triple burst — stamp unlock, achievement */
    fun successBurst() {
        vibrator.vibrate(
            VibrationEffect.createWaveform(
                longArrayOf(0, 35, 55, 55, 70, 55, 90),
                intArrayOf(0, 100, 0, 160, 0, 230, 0),
                -1
            )
        )
    }
}

@Composable
fun rememberHapticManager(): HapticManager {
    val context = LocalContext.current
    return remember { HapticManager(context) }
}
