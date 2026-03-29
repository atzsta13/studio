package com.example.szigerinsider2026.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

import androidx.compose.ui.graphics.Color
import com.example.szigerinsider2026.data.config.FestivalConfig

// Always force tactical OLED dark mode for this app.
@Composable
private fun getTacticalColorScheme() = darkColorScheme(
    primary = Color(FestivalConfig.current.primaryColorHex),
    secondary = Color(FestivalConfig.current.accentColorHex),
    tertiary = Color(FestivalConfig.current.secondaryColorHex),
    background = OLEDBlack,
    surface = CardBackground,
    onPrimary = TextPrimary,
    onSecondary = OLEDBlack,
    onTertiary = OLEDBlack,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
)

@Composable
fun FestivalInsiderTheme(
    content: @Composable () -> Unit
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = OLEDBlack.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = getTacticalColorScheme(),
        typography = BrutalistTypography,
        content = content
    )
}
