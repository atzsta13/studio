package org.openfestivalhub

import org.openfestivalhub.data.config.*

object TestConfig {
    val data = FestivalConfigData(
        id = "test-festival",
        slug = "test",
        name = "Test Festival",
        fullName = "Test Festival 2026",
        appName = "Test Insider",
        tagline = "Test Tagline",
        description = "Test Description",
        officialWebsite = "https://test.com",
        deepLinkScheme = "test2026",
        aiPersona = "Test Persona",
        location = FestivalLocation(
            city = "Test City",
            country = "Test Country",
            countryCode = "TC",
            venue = "Test Venue",
            timezone = "UTC",
            lat = 0.0,
            lng = 0.0,
            weatherDisplayName = "Test Weather"
        ),
        dates = FestivalDates(
            year = 2026,
            startDate = "2026-01-01",
            endDate = "2026-01-03",
            days = listOf("Friday", "Saturday", "Sunday"),
            dayLabels = mapOf("Friday" to "FRI", "Saturday" to "SAT", "Sunday" to "SUN"),
            openingDayFilter = "Friday"
        ),
        currency = FestivalCurrency(
            localCode = "TST",
            localName = "Test Coin",
            eurRate = 1.0,
            usdRate = 1.0,
            gbpRate = 1.0,
            showConverter = true
        ),
        theme = FestivalTheme(
            primaryHex = "#FF0080",
            primaryHsl = "326 100% 50%",
            accentHex = "#FFEE00",
            accentHsl = "55 100% 50%",
            secondaryHex = "#00C3FF",
            secondaryHsl = "194 100% 50%",
            backgroundHex = "#000000",
            backgroundHsl = "0 0% 0%",
            cardHex = "#111111",
            cardHsl = "0 0% 7%",
            glowColor = "rgba(255, 0, 128, 0.4)",
            aesthetic = "brutalist",
            androidPrimaryLong = "0xFFFF0080",
            androidAccentLong = "0xFFFFEE00",
            androidSecondaryLong = "0xFF00C3FF"
        ),
        features = FestivalFeatures(
            hydrationTracker = true,
            sunscreenAlert = true,
            waterCounter = true
        )
    )
}
