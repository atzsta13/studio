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

// Always force tactical OLED dark mode for this app.
private val TacticalColorScheme = darkColorScheme(
    primary = PrimaryMagenta,
    secondary = AcidYellow,
    tertiary = ToxicGreen,
    background = OLEDBlack,
    surface = CardBackground,
    onPrimary = TextPrimary,
    onSecondary = OLEDBlack,
    onTertiary = OLEDBlack,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
)

@Composable
fun SzigetInsiderTheme(
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
        colorScheme = TacticalColorScheme,
        typography = BrutalistTypography,
        content = content
    )
}
