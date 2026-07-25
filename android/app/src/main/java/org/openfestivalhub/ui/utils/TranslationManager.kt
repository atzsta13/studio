package org.openfestivalhub.ui.utils

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalConfiguration
import org.openfestivalhub.data.config.FestivalConfig
import java.util.Locale

object TranslationManager {

    /**
     * Translates a key based on the current system locale or festival default.
     */
    @Composable
    fun getString(key: String): String {
        val config = FestivalConfig.current
        val i18n = config.i18n ?: return key
        
        val systemLocale = LocalConfiguration.current.locales[0].language
        
        // Priority: 1. System Locale, 2. Default Config Locale, 3. Key itself
        val targetLocale = if (i18n.locales.contains(systemLocale)) {
            systemLocale
        } else {
            i18n.defaultLocale
        }
        
        return i18n.translations[targetLocale]?.get(key) ?: key
    }
}

/**
 * Convenient shorthand for TranslationManager.getString(key)
 */
@Composable
fun t(key: String): String = TranslationManager.getString(key)
