package com.example.szigerinsider2026.ui.utils

import com.example.szigerinsider2026.data.config.FestivalConfig
import com.example.szigerinsider2026.data.model.Artist
import java.time.LocalDate
import java.time.LocalTime
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

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
        val setTime = LocalTime.parse(artist.startTime, DateTimeFormatter.ofPattern("HH:mm"))
        
        val setDateTime = LocalDateTime.of(setDate, setTime)
        val now = LocalDateTime.now()

        return now.isAfter(setDateTime)
    } catch (e: Exception) {
        e.printStackTrace()
        return false
    }
}
