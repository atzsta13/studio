package com.example.szigerinsider2026.data.config

import android.content.Context
import android.content.Intent
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.InputStreamReader

@Serializable
data class FestivalFeatures(
    val currencyConverter: Boolean = false,
    val tentFinder: Boolean = false,
    val vibeQuiz: Boolean = false,
    val passport: Boolean = false,
    val aiRecommendations: Boolean = false,
    val survivalGuide: Boolean = false,
    val timetable: Boolean = false,
    val cashlessLink: Boolean = false,
    val cashlessUrl: String? = null,
    val dayparkNightpark: Boolean = false,
    val familyZone: Boolean = false,
    val hydrationTracker: Boolean = false,
    val sunscreenAlert: Boolean = false,
    val batterySaver: Boolean = false,
    val friendFinder: Boolean = false,
    val groupSchedules: Boolean = false,
    val similarArtists: Boolean = false,
    val vibeOfTheHour: Boolean = false,
    val merchCatalog: Boolean = false,
    val foodRatings: Boolean = false,
    val budgetTracker: Boolean = false,
    val lostAndFound: Boolean = false,
    val sosMorseCode: Boolean = false,
    val festivalDictionary: Boolean = false,
    val firstAidFinder: Boolean = false,
    val chargingStations: Boolean = false,
    val shuttleTimetable: Boolean = false,
    val weatherRadar: Boolean = false,
    val collabPlaylists: Boolean = false,
    val arStageView: Boolean = false,
    val fanPolls: Boolean = false,
    val photoWall: Boolean = false,
    val clashResolver: Boolean = false,
    val posterGenerator: Boolean = false,
    val customThemes: Boolean = false,
    val waterCounter: Boolean = false,
    val carFinder: Boolean = false,
    val notesJournal: Boolean = false,
    val setCountdowns: Boolean = false,
    val surpriseRoulette: Boolean = false,
    val genreBreakdown: Boolean = false,
    val vibeAnalysis: Boolean = false,
    val accessibilityMap: Boolean = false,
    val quietZones: Boolean = false,
    val secretStages: Boolean = false,
    val offlineBanner: Boolean = false,
    val audioMonitor: Boolean = false,
    val highContrast: Boolean = false,
    val feedbackSystem: Boolean = false,
    val newsBulletin: Boolean = false
)

@Serializable
data class EmergencyContact(val phone: String, val label: String)

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
    private const val PREFS_NAME = "festival_insider_prefs"
    private const val KEY_FESTIVAL_ID = "selected_festival_id"
    private const val DEFAULT_FESTIVAL_ID = "sziget-2026"

    val AVAILABLE_IDS = listOf(
        "sziget-2026",
        "novarock-2026",
        "frequency-2026",
        "area53-2026",
        "ernte-punk-2026",
        "rock-am-ring-2026"
    )

    private var _current: FestivalConfigData? = null

    val current: FestivalConfigData
        get() = _current ?: throw IllegalStateException("FestivalConfig not initialized.")

    fun getSelectedId(context: Context): String =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_FESTIVAL_ID, null) ?: ""

    fun isSelected(context: Context): Boolean = getSelectedId(context).isNotEmpty()

    fun initialize(context: Context) {
        if (_current != null) return
        val id = getSelectedId(context).ifEmpty { DEFAULT_FESTIVAL_ID }
        _current = load(context, id)
            ?: load(context, DEFAULT_FESTIVAL_ID)
            ?: error("Failed to load config for '$id' and default — config.json schema mismatch?")
    }

    fun switchFestival(context: Context, festivalId: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_FESTIVAL_ID, festivalId)
            .commit()
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
        if (intent != null) context.startActivity(intent)
        // Kill the process so no in-flight coroutine touches the closed/old-festival DB.
        if (context is android.app.Activity) context.finishAffinity()
        android.os.Process.killProcess(android.os.Process.myPid())
    }

    internal fun load(context: Context, id: String): FestivalConfigData? = try {
        val stream = context.assets.open("$id/config.json")
        val json = kotlinx.serialization.json.Json { ignoreUnknownKeys = true }
        json.decodeFromString<FestivalConfigData>(InputStreamReader(stream).readText())
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }

    fun setTestConfig(config: FestivalConfigData) {
        _current = config
    }

    val NAME get() = current.name
    val DAYS get() = current.dates.days
    val DAY_LABELS get() = current.dates.dayLabels
    val TIMEZONE get() = current.location.timezone
    val FEATURES get() = current.features
    val DEEP_LINK_SCHEME get() = current.deepLinkScheme
}
