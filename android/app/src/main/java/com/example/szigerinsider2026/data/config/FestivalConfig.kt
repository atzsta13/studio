package com.example.szigerinsider2026.data.config

import android.content.Context
import com.example.szigerinsider2026.BuildConfig
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.InputStreamReader

@Serializable
data class FestivalFeatures(
    val currencyConverter: Boolean,
    val tentFinder: Boolean,
    val vibeQuiz: Boolean,
    val passport: Boolean,
    val spotifyIntegration: Boolean,
    val aiRecommendations: Boolean,
    val survivalGuide: Boolean,
    val timetable: Boolean,
    val cashlessLink: Boolean,
    val cashlessUrl: String? = null,
    val dayparkNightpark: Boolean,
    val familyZone: Boolean,

    // Phase 3 Hyper-Insider Expansion (50 Features)
    val hydrationTracker: Boolean,
    val sunscreenAlert: Boolean,
    val batterySaver: Boolean,
    val friendFinder: Boolean,
    val groupSchedules: Boolean,
    val artistTrivia: Boolean,
    val similarArtists: Boolean,
    val vibeOfTheHour: Boolean,
    val stageCapacity: Boolean,
    val merchCatalog: Boolean,
    val foodRatings: Boolean,
    val budgetTracker: Boolean,
    val lostAndFound: Boolean,
    val sosMorseCode: Boolean,
    val festivalDictionary: Boolean,
    val firstAidFinder: Boolean,
    val chargingStations: Boolean,
    val shuttleTimetable: Boolean,
    val weatherRadar: Boolean,
    val setlistLinks: Boolean,
    val collabPlaylists: Boolean,
    val arStageView: Boolean,
    val fanPolls: Boolean,
    val photoWall: Boolean,
    val clashResolver: Boolean,
    val posterGenerator: Boolean,
    val customThemes: Boolean,
    val waterCounter: Boolean,
    val carFinder: Boolean,
    val notesJournal: Boolean,
    val socialFeed: Boolean,
    val newsBulletin: Boolean,
    val setCountdowns: Boolean,
    val surpriseRoulette: Boolean,
    val genreBreakdown: Boolean,
    val vibeAnalysis: Boolean,
    val accessibilityMap: Boolean,
    val quietZones: Boolean,
    val crowdHeatmap: Boolean,
    val merchPriceWatch: Boolean,
    val ecoWarrior: Boolean,
    val secretStages: Boolean,
    val afterMovie: Boolean,
    val feedbackSystem: Boolean,
    val offlineBanner: Boolean,
    val audioMonitor: Boolean,
    val highContrast: Boolean
)

@Serializable
data class EmergencyContact(
    val phone: String,
    val label: String
)

@Serializable
data class EmergencyContacts(
    val security: EmergencyContact? = null,
    val medical: EmergencyContact? = null
)

@Serializable
data class RadarFocusConfig(
    val id: String,
    val label: String,
    val targetStages: List<String>? = null,
    val targetGenres: List<String>? = null
)

@Serializable
data class FestivalContent(
    val emergencyContacts: EmergencyContacts? = null,
    val hiddenGems: List<String>? = null,
    val radarFocuses: List<RadarFocusConfig>? = null
)

@Serializable
data class FestivalTheme(
    val primaryHex: String,
    val primaryHsl: String,
    val accentHex: String,
    val accentHsl: String,
    val secondaryHex: String,
    val secondaryHsl: String,
    val backgroundHex: String,
    val backgroundHsl: String,
    val cardHex: String,
    val cardHsl: String,
    val glowColor: String,
    val aesthetic: String,
    val androidPrimaryLong: String,
    val androidAccentLong: String,
    val androidSecondaryLong: String
)

@Serializable
data class FestivalLocation(
    val city: String,
    val country: String,
    val countryCode: String,
    val venue: String,
    val timezone: String,
    val lat: Double,
    val lng: Double,
    val weatherDisplayName: String
)

@Serializable
data class FestivalDates(
    val year: Int,
    val startDate: String,
    val endDate: String,
    val days: List<String>,
    val dayLabels: Map<String, String>,
    val openingDayFilter: String
)

@Serializable
data class FestivalCurrency(
    val localCode: String,
    val localName: String,
    val eurRate: Double,
    val usdRate: Double,
    val gbpRate: Double,
    val showConverter: Boolean
)

@Serializable
data class FestivalI18n(
    val defaultLocale: String,
    val locales: List<String>,
    val translations: Map<String, Map<String, String>>
)

@Serializable
data class FestivalConfigData(
    val id: String,
    val slug: String,
    val name: String,
    val fullName: String,
    val appName: String,
    val tagline: String,
    val description: String,
    val officialWebsite: String,
    val productionUrl: String? = null,
    val deepLinkScheme: String,
    val i18n: FestivalI18n? = null,
    val aiPersona: String,
    val location: FestivalLocation,
    val dates: FestivalDates,
    val currency: FestivalCurrency,
    val theme: FestivalTheme,
    val features: FestivalFeatures,
    val content: FestivalContent? = null
)

object FestivalConfig {
    private var _current: FestivalConfigData? = null
    
    val current: FestivalConfigData
        get() = _current ?: throw IllegalStateException("FestivalConfig not initialized. Call initialize(context) first.")

    fun initialize(context: Context) {
        if (_current != null) return
        try {
            val inputStream = context.assets.open("config.json")
            val reader = InputStreamReader(inputStream)
            val jsonString = reader.readText()
            _current = Json { ignoreUnknownKeys = true }.decodeFromString<FestivalConfigData>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
            // Fallback or crash gracefully
        }
    }

    // Direct accessors for frequently used fields
    val NAME get() = current.name
    val DAYS get() = current.dates.days
    val DAY_LABELS get() = current.dates.dayLabels
    val TIMEZONE get() = current.location.timezone
    val FEATURES get() = current.features
    val DEEP_LINK_SCHEME get() = current.deepLinkScheme
}
