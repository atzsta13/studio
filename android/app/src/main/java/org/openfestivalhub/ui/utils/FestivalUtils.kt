package org.openfestivalhub.ui.utils

import org.openfestivalhub.data.config.FestivalConfig
import org.openfestivalhub.data.model.Artist
import java.time.LocalDate
import java.time.LocalTime
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

fun parseTime(t: String?): LocalTime? {
    if (t == null) return null
    return try {
        java.time.OffsetDateTime.parse(t).toLocalTime()
    } catch (_: Exception) {
        try {
            LocalTime.parse(t, DateTimeFormatter.ofPattern("HH:mm"))
        } catch (_: Exception) { null }
    }
}

fun formatTime(t: String?): String =
    parseTime(t)?.format(DateTimeFormatter.ofPattern("HH:mm")) ?: ""

fun getFestivalDay(): String {
    val config = FestivalConfig.current
    val today = LocalDate.now()
    val dayOfWeek = today.dayOfWeek.getDisplayName(TextStyle.FULL, Locale.ENGLISH)
    
    // Check if current day is in festival days
    return if (config.dates.days.contains(dayOfWeek)) {
        dayOfWeek
    } else {
        config.dates.days.firstOrNull() ?: "Friday"
    }
}

fun hasSetStarted(artist: Artist): Boolean {
    val config = FestivalConfig.current
    if (artist.day == null || artist.startTime == null) return false

    try {
        val startDate = LocalDate.parse(config.dates.startDate)
        val dayIndex = config.dates.days.indexOf(artist.day)
        if (dayIndex == -1) return false

        val setDate = startDate.plusDays(dayIndex.toLong())
        val setTime = parseTime(artist.startTime) ?: return false

        val setDateTime = LocalDateTime.of(setDate, setTime)
        val now = LocalDateTime.now()

        return now.isAfter(setDateTime)
    } catch (e: Exception) {
        e.printStackTrace()
        return false
    }
}
