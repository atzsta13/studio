package com.example.szigerinsider2026.data.config

import java.util.Calendar

/**
 * Single source of truth for all festival-specific constants.
 *
 * When adapting this app for a different festival, only this file needs to change
 * (plus lineup.json, poi.json, food.json assets, and the survival guide content).
 *
 * All screens that were previously hardcoding festival dates, currency, day names,
 * or timezone strings now reference this object.
 */
object FestivalConfig {

    // ── Identity ──────────────────────────────────────────────────────────────

    const val NAME         = "Sziget"
    const val TAGLINE      = "Island of Freedom"
    const val YEAR         = 2026
    const val CITY         = "Budapest"
    const val COUNTRY_CODE = "HU"
    const val VENUE        = "Óbudai-sziget"
    const val TIMEZONE     = "Europe/Budapest"

    // ── Dates ─────────────────────────────────────────────────────────────────
    //
    // START_MONTH is 1-indexed (for java.time.LocalDate).
    // CALENDAR_START_MONTH is 0-indexed (for java.util.Calendar).

    const val START_YEAR  = 2026
    const val START_MONTH = 8           // August, 1-indexed (java.time)
    const val START_DAY   = 6           // Aug 6
    const val END_MONTH   = 8
    const val END_DAY     = 12          // Aug 12

    val CALENDAR_START_MONTH: Int = Calendar.AUGUST  // 0-indexed (java.util.Calendar)

    // ── Display strings ───────────────────────────────────────────────────────

    const val DATE_DISPLAY       = "Aug 6 – 12, Budapest"
    const val DATE_VENUE_DISPLAY = "Aug 6 – 12 · Budapest · Óbudai-sziget"

    // ── Currency ──────────────────────────────────────────────────────────────
    //
    // EUR_RATE / USD_RATE: how many local currency units equal 1 EUR/USD.
    // Conversion multiplier = 1 / RATE.

    const val LOCAL_CURRENCY_CODE = "HUF"
    const val LOCAL_CURRENCY_NAME = "Forint"
    const val EUR_RATE            = 400.0   // 1 EUR ≈ 400 HUF
    const val USD_RATE            = 370.0   // 1 USD ≈ 370 HUF

    // ── Festival days ─────────────────────────────────────────────────────────
    //
    // DAYS[0] corresponds to START_DAY, DAYS[last] to END_DAY.
    // DAY_LABELS maps day name → short tab label.
    // DAY_CALENDAR_DATES maps day name → (Calendar.MONTH 0-indexed, day-of-month)
    //   for use with java.util.Calendar.

    val DAYS: List<String> = listOf(
        "Wednesday",  // Aug 6
        "Thursday",   // Aug 7
        "Friday",     // Aug 8
        "Saturday",   // Aug 9
        "Sunday",     // Aug 10
        "Monday",     // Aug 11
        "Tuesday"     // Aug 12
    )

    val DAY_LABELS: Map<String, String> = mapOf(
        "Wednesday" to "WED",
        "Thursday"  to "THU",
        "Friday"    to "FRI",
        "Saturday"  to "SAT",
        "Sunday"    to "SUN",
        "Monday"    to "MON",
        "Tuesday"   to "TUE"
    )

    /** day name → (Calendar.MONTH 0-indexed, day-of-month) */
    val DAY_CALENDAR_DATES: Map<String, Pair<Int, Int>> = DAYS
        .mapIndexed { i, day -> day to Pair(CALENDAR_START_MONTH, START_DAY + i) }
        .toMap()
}
