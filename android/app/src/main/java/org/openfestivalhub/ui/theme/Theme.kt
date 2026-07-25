package org.openfestivalhub.ui.theme

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
import org.openfestivalhub.data.config.FestivalConfig

// Always force tactical OLED dark mode for this app.
@Composable
private fun getTacticalColorScheme() = darkColorScheme(
    primary = Color(java.lang.Long.decode(FestivalConfig.current.theme.androidPrimaryLong)),
    secondary = Color(java.lang.Long.decode(FestivalConfig.current.theme.androidAccentLong)),
    tertiary = Color(java.lang.Long.decode(FestivalConfig.current.theme.androidSecondaryLong)),
    background = OLEDBlack,
    surface = CardBackground,
    onPrimary = TextPrimary,
    onSecondary = OLEDBlack,
    onTertiary = OLEDBlack,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
)

@Composable
fun OpenFestivalHubTheme(
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
