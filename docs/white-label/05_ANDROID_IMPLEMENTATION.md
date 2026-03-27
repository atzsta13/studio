# Android Implementation Guide

Step-by-step changes for converting the Android app to a multi-festival build using Gradle product flavors.

---

## Overview

**Current state**: Single APK, hardcoded Sziget branding, package `com.example.szigerinsider2026`.

**Target state**: 4 APKs from one codebase, each with its own:
- Application ID (separate Play Store listing)
- App name and icon
- Festival data assets (lineup.json, poi.json, food.json, guide.json)
- Deep link scheme (for Spotify OAuth)
- Branding colors

---

## Step 1: Rename Base Package

The current package `com.example.szigerinsider2026` needs to become a generic base package. In Android Studio:

1. Open `android/app/src/main/java/com/example/szigerinsider2026/`
2. Right-click the package root → **Refactor → Rename**
3. Rename to `com.yourcompany.festivalinsider` (replace `yourcompany` with your actual company name)
4. Android Studio will update all import statements and `AndroidManifest.xml`
5. Update `android/app/build.gradle.kts` `namespace` field to match

The product flavor `applicationId` values then override this base ID per flavor:
- `com.yourcompany.szigetinsider`
- `com.yourcompany.area53insider`
- `com.yourcompany.novarockinsider`
- `com.yourcompany.frequencyinsider`

---

## Step 2: `android/app/build.gradle.kts` — Full Product Flavor Setup

```kotlin
// android/app/build.gradle.kts
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.yourcompany.festivalinsider"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    // ── Product Flavors ──────────────────────────────────────────────────────
    flavorDimensions += "festival"

    productFlavors {
        create("sziget") {
            dimension = "festival"
            applicationId = "com.yourcompany.szigetinsider"
            versionName = "2.0"
            resValue("string", "app_name", "Sziget Insider 2026")
            buildConfigField("String", "FESTIVAL_ID", "\"sziget-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "sziget2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("area53") {
            dimension = "festival"
            applicationId = "com.yourcompany.area53insider"
            versionName = "1.0"
            resValue("string", "app_name", "Area 53 Insider 2026")
            buildConfigField("String", "FESTIVAL_ID", "\"area53-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "area532026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("novarock") {
            dimension = "festival"
            applicationId = "com.yourcompany.novarockinsider"
            versionName = "1.0"
            resValue("string", "app_name", "Nova Rock Insider 2026")
            buildConfigField("String", "FESTIVAL_ID", "\"novarock-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "novarock2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("frequency") {
            dimension = "festival"
            applicationId = "com.yourcompany.frequencyinsider"
            versionName = "1.0"
            resValue("string", "app_name", "Frequency Insider 2026")
            buildConfigField("String", "FESTIVAL_ID", "\"frequency-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "frequency2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
    }

    // ── Per-flavor asset source sets ─────────────────────────────────────────
    sourceSets {
        // Each flavor gets its own assets directory for festival JSON data + icons
        getByName("sziget")    { assets.srcDirs("src/sziget/assets") }
        getByName("area53")    { assets.srcDirs("src/area53/assets") }
        getByName("novarock")  { assets.srcDirs("src/novarock/assets") }
        getByName("frequency") { assets.srcDirs("src/frequency/assets") }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true   // Required for BuildConfig.FESTIVAL_ID
    }
}
```

---

## Step 3: Asset Directory Structure

Create these directories and populate each with the correct data files:

```
android/app/src/
├── main/                         ← shared code (no festival JSON here)
│   ├── java/com/yourcompany/festivalinsider/
│   └── res/
│       └── values/
│           └── strings.xml       ← remove app_name (it's a resValue now)
│
├── sziget/
│   └── assets/
│       ├── lineup.json           ← from festivals/sziget-2026/data/
│       ├── poi.json
│       ├── food.json
│       └── guide.json
│
├── area53/
│   └── assets/
│       ├── lineup.json           ← from festivals/area53-2026/data/
│       ├── poi.json
│       ├── food.json
│       └── guide.json
│
├── novarock/
│   └── assets/
│       └── ... (same)
│
└── frequency/
    └── assets/
        └── ... (same)
```

Sync using the npm script: `npm run android:sync:area53` (see `03_DATA_PIPELINE.md`).

---

## Step 4: `FestivalConfig.kt` — Updated (see `02_CONFIG_SYSTEM.md`)

The full `FestivalConfig.kt` is documented in `02_CONFIG_SYSTEM.md`. Key change: the object now has a `current` property that switches on `BuildConfig.FESTIVAL_ID`.

After this change, every screen that previously used `FestivalConfig.NAME` continues to work unchanged — the accessor delegates to `current.name`.

---

## Step 5: `AndroidManifest.xml` — Deep Link with Placeholder

Replace the hardcoded `sziget` scheme with a manifest placeholder:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->

<!-- BEFORE -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="sziget" android:host="spotify-callback" />
</intent-filter>

<!-- AFTER -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="${deepLinkScheme}" android:host="${deepLinkHost}" />
</intent-filter>
```

---

## Step 6: `MainActivity.kt` — Deep Link Scheme Check

```kotlin
// BEFORE
if (uri?.scheme == "sziget" && uri.host == "spotify-callback") { ... }

// AFTER
import com.yourcompany.festivalinsider.data.config.FestivalConfig

if (uri?.scheme == FestivalConfig.DEEP_LINK_SCHEME && uri.host == "spotify-callback") { ... }
```

---

## Step 7: `Theme.kt` — Colors from Config

```kotlin
// android/.../ui/theme/Theme.kt

// BEFORE
@Composable
fun SzigetInsiderTheme(content: @Composable () -> Unit) {
    val colorScheme = darkColorScheme(
        primary   = Color(0xFFFF0080),
        secondary = Color(0xFF00C3FF),
        tertiary  = Color(0xFFFFEE00),
        background = Color(0xFF09090B),
        surface    = Color(0xFF131315),
    )
    MaterialTheme(colorScheme = colorScheme) { content() }
}

// AFTER
import com.yourcompany.festivalinsider.data.config.FestivalConfig

@Composable
fun FestivalInsiderTheme(content: @Composable () -> Unit) {
    val config = FestivalConfig.current
    val colorScheme = darkColorScheme(
        primary    = Color(config.primaryColorHex),
        secondary  = Color(config.secondaryColorHex),
        tertiary   = Color(config.accentColorHex),
        background = Color(0xFF09090B),  // OLED black stays constant
        surface    = Color(0xFF131315),  // Card background stays constant
    )
    MaterialTheme(colorScheme = colorScheme) { content() }
}
```

Update all call sites from `SzigetInsiderTheme { }` to `FestivalInsiderTheme { }`.

---

## Step 8: `WeatherRepository.kt` — Coordinates from Config

```kotlin
// BEFORE
private val BASE_URL = "https://api.open-meteo.com/v1/forecast" +
    "?latitude=47.5194&longitude=19.0512&timezone=Europe%2FBudapest&..."

// AFTER
import com.yourcompany.festivalinsider.data.config.FestivalConfig
import java.net.URLEncoder

private val BASE_URL = run {
    val lat = FestivalConfig.LAT
    val lng = FestivalConfig.LNG
    val tz  = URLEncoder.encode(FestivalConfig.TIMEZONE, "UTF-8")
    "https://api.open-meteo.com/v1/forecast" +
        "?latitude=$lat&longitude=$lng&timezone=$tz" +
        "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max" +
        "&current_weather=true&forecast_days=7"
}
```

---

## Step 9: `DiscoverViewModel.kt` — Days list from Config

```kotlin
// BEFORE
private val dayOrder = listOf(
    "Wednesday", "Thursday", "Friday", "Saturday",
    "Sunday", "Monday", "Tuesday"
)

// AFTER
private val dayOrder = FestivalConfig.DAYS
```

---

## Step 10: `HomeScreen.kt` — Opening day filter

```kotlin
// BEFORE (conceptual)
val openingDay = "Wednesday"

// AFTER
val openingDay = FestivalConfig.OPENING_DAY
```

---

## Step 11: `ToolsScreen.kt` — Feature flag gates

```kotlin
// Wrap currency converter with feature flag
if (FestivalConfig.FEATURES.currencyConverter) {
    CurrencyConverterCard(
        currencyCode = FestivalConfig.CURRENCY_CODE,
        eurRate = FestivalConfig.EUR_RATE,
    )
}

// Show cashless link for Nova Rock / Frequency
val cashlessUrl = FestivalConfig.FEATURES.cashlessUrl
if (FestivalConfig.FEATURES.cashlessLink && cashlessUrl != null) {
    CashlessWalletCard(url = cashlessUrl)
}
```

---

## Step 12: `SurvivalGuideContent.kt` — Move to guide.json

The current `SurvivalGuideContent.kt` hardcodes Hungarian phrases, Budapest Keleti shuttle info, and HUF tips. This content should be moved to the festival's `guide.json` asset and loaded dynamically by the existing `GuideRepository` (or equivalent).

**Migration:**
1. Extract the Kotlin strings into `festivals/sziget-2026/data/guide.json` (JSON format defined in `03_DATA_PIPELINE.md`)
2. Create `festivals/area53-2026/data/guide.json` with Austrian content
3. Load via `context.assets.open("guide.json")` in the guide repository
4. Delete `SurvivalGuideContent.kt`

---

## Step 13: Widget Rename

```kotlin
// BEFORE: class SzigetWidget
// AFTER:  class FestivalWidget

// Also rename:
// res/xml/sziget_widget_info.xml → festival_widget_info.xml
// Update AndroidManifest.xml receiver android:name reference
```

---

## Step 14: `strings.xml` Cleanup

After product flavors are set up, `app_name` is injected via `resValue` in build.gradle.kts. Remove it from the static strings file to avoid conflicts:

```xml
<!-- android/app/src/main/res/values/strings.xml -->
<!-- BEFORE -->
<resources>
    <string name="app_name">Sziger Insider 2026</string>
</resources>

<!-- AFTER (app_name removed — it's a resValue per flavor) -->
<resources>
    <!-- app_name is set per product flavor in build.gradle.kts -->
</resources>
```

---

## Build Commands

```bash
# Build a specific flavor debug APK
./gradlew assembleSzigetDebug
./gradlew assembleArea53Debug
./gradlew assembleNovarockDebug
./gradlew assembleFrequencyDebug

# Build all release APKs (requires signing config)
./gradlew assembleRelease

# Run unit tests for a specific flavor
./gradlew testSzigetDebugUnitTest
./gradlew testArea53DebugUnitTest

# Install a specific flavor on connected device
./gradlew installSzigetDebug
./gradlew installArea53Debug

# Generate App Bundle for Play Store (release)
./gradlew bundleSzigetRelease
./gradlew bundleArea53Release
```

---

## Android File Change Checklist

| Priority | File | Change |
|---|---|---|
| 🔴 Critical | `build.gradle.kts` | Add product flavors + sourceSets |
| 🔴 Critical | `data/config/FestivalConfig.kt` | Switch on BuildConfig.FESTIVAL_ID |
| 🔴 Critical | `AndroidManifest.xml` | Replace scheme literal with placeholder |
| 🔴 Critical | `MainActivity.kt` | Read deep link scheme from config |
| 🔴 Critical | `ui/theme/Theme.kt` | Read colors from FestivalConfig |
| 🔴 Critical | `data/repository/WeatherRepository.kt` | Coords from config |
| 🟡 High | `ui/discover/DiscoverViewModel.kt` | Days list from config |
| 🟡 High | `ui/home/HomeScreen.kt` | Opening day from config |
| 🟡 High | `ui/tools/ToolsScreen.kt` | Feature flag gates |
| 🟡 High | `data/content/SurvivalGuideContent.kt` | Move to guide.json |
| 🟡 High | `res/values/strings.xml` | Remove app_name |
| 🟢 Medium | `widget/SzigetWidget.kt` | Rename to FestivalWidget |
| 🟢 Medium | `res/xml/sziget_widget_info.xml` | Rename to festival_widget_info.xml |
| 🟢 Medium | Per-flavor `assets/` directories | Create + populate with JSON |
| 🟢 Medium | Base package rename | `com.example.szigerinsider2026` → `com.yourcompany.festivalinsider` |
