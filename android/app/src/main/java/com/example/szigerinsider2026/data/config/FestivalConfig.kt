package com.example.szigerinsider2026.data.config

import com.example.szigerinsider2026.BuildConfig
import java.util.Calendar

data class FestivalFeatures(
    val currencyConverter: Boolean,
    val tentFinder: Boolean,
    val vibeQuiz: Boolean,
    val passport: Boolean,
    val spotifyIntegration: Boolean,
    val timetable: Boolean,
    val cashlessLink: Boolean,
    val cashlessUrl: String?,
    val dayparkNightpark: Boolean,
    val familyZone: Boolean,
)

data class FestivalConfigData(
    val id: String,
    val name: String,
    val tagline: String,
    val year: Int,
    val city: String,
    val countryCode: String,
    val venue: String,
    val timezone: String,
    val weatherDisplayName: String,
    val startYear: Int,
    val startMonth: Int,         // 1-indexed (java.time)
    val startDay: Int,
    val endMonth: Int,
    val endDay: Int,
    val calendarStartMonth: Int, // Calendar.JANUARY = 0 constant
    val dateDisplay: String,
    val dateVenueDisplay: String,
    val days: List<String>,
    val dayLabels: Map<String, String>,
    val openingDayFilter: String,
    val lat: Double,
    val lng: Double,
    val localCurrencyCode: String,
    val localCurrencyName: String,
    val eurRate: Double,
    val usdRate: Double,
    val showCurrencyConverter: Boolean,
    val aiPersona: String,
    val deepLinkScheme: String,
    val officialWebsite: String,
    val primaryColorHex: Long,   // e.g. 0xFFFF0080L (ARGB)
    val accentColorHex: Long,
    val secondaryColorHex: Long,
    val features: FestivalFeatures,
)

object FestivalConfig {

    val current: FestivalConfigData by lazy {
        when (BuildConfig.FESTIVAL_ID) {
            "sziget-2026"    -> sziget2026
            "area53-2026"    -> area532026
            "novarock-2026"  -> novarock2026
            "frequency-2026" -> frequency2026
            else -> throw IllegalStateException(
                "Unknown FESTIVAL_ID: '${BuildConfig.FESTIVAL_ID}'"
            )
        }
    }

    // Convenience accessors
    val NAME              get() = current.name
    val DAYS              get() = current.days
    val DAY_LABELS        get() = current.dayLabels
    val OPENING_DAY       get() = current.openingDayFilter
    val LAT               get() = current.lat
    val LNG               get() = current.lng
    val TIMEZONE          get() = current.timezone
    val CURRENCY_CODE     get() = current.localCurrencyCode
    val EUR_RATE          get() = current.eurRate
    val DEEP_LINK_SCHEME  get() = current.deepLinkScheme
    val FEATURES          get() = current.features

    // ── Sziget 2026 ────────────────────────────────────────────────────────
    private val sziget2026 = FestivalConfigData(
        id = "sziget-2026",
        name = "Sziget",
        tagline = "Island of Freedom",
        year = 2026,
        city = "Budapest",
        countryCode = "HU",
        venue = "Óbudai-sziget",
        timezone = "Europe/Budapest",
        weatherDisplayName = "Budapest · Óbudai-sziget",
        startYear = 2026, startMonth = 8, startDay = 5, // Corrected to Aug 5
        endMonth = 8, endDay = 11,
        calendarStartMonth = Calendar.AUGUST,
        dateDisplay = "Aug 5 – 11, Budapest",
        dateVenueDisplay = "Aug 5 – 11 · Budapest · Óbudai-sziget",
        days = listOf("Wednesday","Thursday","Friday","Saturday","Sunday","Monday","Tuesday"),
        dayLabels = mapOf(
            "Wednesday" to "WED", "Thursday" to "THU", "Friday" to "FRI",
            "Saturday" to "SAT", "Sunday" to "SUN", "Monday" to "MON", "Tuesday" to "TUE"
        ),
        openingDayFilter = "Wednesday",
        lat = 47.5194, lng = 19.0512,
        localCurrencyCode = "HUF", localCurrencyName = "Forint",
        eurRate = 400.0, usdRate = 370.0,
        showCurrencyConverter = true,
        aiPersona = "the Sziget Insider Scout, a legendary festival veteran who knows every corner of the Island of Freedom",
        deepLinkScheme = "sziget2026",
        officialWebsite = "https://szigetfestival.com",
        primaryColorHex = 0xFFFF0080L,
        accentColorHex  = 0xFFFFEE00L,
        secondaryColorHex = 0xFF00C3FFL,
        features = FestivalFeatures(
            currencyConverter = true, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = false, cashlessUrl = null,
            dayparkNightpark = false, familyZone = false,
        ),
    )

    // ── Area 53 2026 ────────────────────────────────────────────────────────
    private val area532026 = FestivalConfigData(
        id = "area53-2026",
        name = "Area 53",
        tagline = "Austria's Biggest Heavy Metal Festival",
        year = 2026,
        city = "Leoben",
        countryCode = "AT",
        venue = "VAZ Schladnitz",
        timezone = "Europe/Vienna",
        weatherDisplayName = "Leoben · VAZ Schladnitz",
        startYear = 2026, startMonth = 7, startDay = 16,
        endMonth = 7, endDay = 18,
        calendarStartMonth = Calendar.JULY,
        dateDisplay = "Jul 16 – 18, Leoben",
        dateVenueDisplay = "Jul 16 – 18 · Leoben · VAZ Schladnitz",
        days = listOf("Thursday","Friday","Saturday"),
        dayLabels = mapOf("Thursday" to "THU", "Friday" to "FRI", "Saturday" to "SAT"),
        openingDayFilter = "Thursday",
        lat = 47.3769, lng = 15.0944,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Area 53 Metal Scout, a battle-hardened metalhead who has attended every edition since 2017",
        deepLinkScheme = "area532026",
        officialWebsite = "https://area53festival.at/en/",
        primaryColorHex = 0xFFCC0000L,
        accentColorHex  = 0xFFFFFFFFL,
        secondaryColorHex = 0xFF888888L,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = false, cashlessUrl = null,
            dayparkNightpark = false, familyZone = false,
        ),
    )

    // ── Nova Rock 2026 ──────────────────────────────────────────────────────
    private val novarock2026 = FestivalConfigData(
        id = "novarock-2026",
        name = "Nova Rock",
        tagline = "Rock the Fields",
        year = 2026,
        city = "Nickelsdorf",
        countryCode = "AT",
        venue = "Pannonia Fields II",
        timezone = "Europe/Vienna",
        weatherDisplayName = "Nickelsdorf · Pannonia Fields II",
        startYear = 2026, startMonth = 6, startDay = 11,
        endMonth = 6, endDay = 14,
        calendarStartMonth = Calendar.JUNE,
        dateDisplay = "Jun 11 – 14, Nickelsdorf",
        dateVenueDisplay = "Jun 11 – 14 · Nickelsdorf · Pannonia Fields II",
        days = listOf("Thursday","Friday","Saturday","Sunday"),
        dayLabels = mapOf(
            "Thursday" to "THU","Friday" to "FRI","Saturday" to "SAT","Sunday" to "SUN"
        ),
        openingDayFilter = "Thursday",
        lat = 47.9381, lng = 17.0651,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Nova Rock Scout, a rock veteran who has survived every Pannonia dust storm since 2005",
        deepLinkScheme = "novarock2026",
        officialWebsite = "https://www.novarock.at/en/",
        primaryColorHex = 0xFFFF6600L,
        accentColorHex  = 0xFFFFD700L,
        secondaryColorHex = 0xFFFF4444L,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = true, cashlessUrl = "https://www.novarock.at/en/cashless/",
            dayparkNightpark = false, familyZone = true,
        ),
    )

    // ── FM4 Frequency 2026 ──────────────────────────────────────────────────
    private val frequency2026 = FestivalConfigData(
        id = "frequency-2026",
        name = "Frequency",
        tagline = "Green Park Comes Alive",
        year = 2026,
        city = "St. Pölten",
        countryCode = "AT",
        venue = "Green Park Traisen",
        timezone = "Europe/Vienna",
        weatherDisplayName = "St. Pölten · Green Park",
        startYear = 2026, startMonth = 8, startDay = 20,
        endMonth = 8, endDay = 22,
        calendarStartMonth = Calendar.AUGUST,
        dateDisplay = "Aug 20 – 22, St. Pölten",
        dateVenueDisplay = "Aug 20 – 22 · St. Pölten · Green Park",
        days = listOf("Thursday","Friday","Saturday"),
        dayLabels = mapOf("Thursday" to "THU","Friday" to "FRI","Saturday" to "SAT"),
        openingDayFilter = "Thursday",
        lat = 48.2088, lng = 15.6360,
        localCurrencyCode = "EUR", localCurrencyName = "Euro",
        eurRate = 1.0, usdRate = 0.92,
        showCurrencyConverter = false,
        aiPersona = "the Frequency Scout, a St. Pölten regular who knows every act on the Daypark stages and Nightpark floors",
        deepLinkScheme = "frequency2026",
        officialWebsite = "https://www.frequency.at/en/",
        primaryColorHex = 0xFF8B00FFL,
        accentColorHex  = 0xFF00FF88L,
        secondaryColorHex = 0xFFFF00AAL,
        features = FestivalFeatures(
            currencyConverter = false, tentFinder = true, vibeQuiz = true,
            passport = true, spotifyIntegration = true, timetable = false,
            cashlessLink = true, cashlessUrl = "https://www.frequency.at/en/cashless/",
            dayparkNightpark = true, familyZone = false,
        ),
    )
}
