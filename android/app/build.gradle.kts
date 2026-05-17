plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21"
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.example.szigerinsider2026"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.szigerinsider2026"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    // ── Product Flavors ──────────────────────────────────────────────────────
    flavorDimensions += "festival"

    productFlavors {
        create("sziget") {
            dimension = "festival"
            applicationId = "com.example.szigetinsider"
            versionName = "2.0"
            resValue("string", "app_name", "dev_Sziget Insider")
            buildConfigField("String", "FESTIVAL_ID", "\"sziget-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "sziget2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("area53") {
            dimension = "festival"
            applicationId = "com.example.area53insider"
            versionName = "1.0"
            resValue("string", "app_name", "dev_Area 53 Insider")
            buildConfigField("String", "FESTIVAL_ID", "\"area53-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "area532026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("novarock") {
            dimension = "festival"
            applicationId = "com.example.novarockinsider"
            versionName = "1.0"
            resValue("string", "app_name", "dev Nova Rock Insider")
            buildConfigField("String", "FESTIVAL_ID", "\"novarock-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "novarock2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("frequency") {
            dimension = "festival"
            applicationId = "com.example.frequencyinsider"
            versionName = "1.0"
            resValue("string", "app_name", "dev_Frequency Insider")
            buildConfigField("String", "FESTIVAL_ID", "\"frequency-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "frequency2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
        create("erntepunk") {
            dimension = "festival"
            applicationId = "com.example.erntepunkinsider"
            versionName = "1.0"
            resValue("string", "app_name", "dev_Ernte Punk Insider")
            buildConfigField("String", "FESTIVAL_ID", "\"ernte-punk-2026\"")
            manifestPlaceholders["deepLinkScheme"] = "erntepunk2026"
            manifestPlaceholders["deepLinkHost"]   = "spotify-callback"
        }
    }

    // ── Per-flavor asset source sets ─────────────────────────────────────────
    sourceSets {
        getByName("sziget")    { assets.srcDirs("src/sziget/assets") }
        getByName("area53")    { assets.srcDirs("src/area53/assets") }
        getByName("novarock")  { assets.srcDirs("src/novarock/assets") }
        getByName("frequency") { assets.srcDirs("src/frequency/assets") }
        getByName("erntepunk") { assets.srcDirs("src/erntepunk/assets") }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation("androidx.activity:activity-compose:1.9.1")
    implementation(platform("androidx.compose:compose-bom:2024.04.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.navigation:navigation-compose:2.8.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
    
    implementation(libs.room.runtime)
    ksp(libs.room.compiler)
    implementation(libs.room.ktx)
    implementation(libs.coil.compose)
    implementation(libs.androidx.material.icons.extended)
    implementation("androidx.glance:glance-appwidget:1.1.0")
    implementation("androidx.glance:glance-material3:1.1.0")

    // QR & Squad Link
    implementation(libs.androidx.camera.camera2)
    implementation(libs.androidx.camera.lifecycle)
    implementation(libs.androidx.camera.view)
    implementation(libs.mlkit.barcode.scanning)
    implementation(libs.zxing.core)
    implementation(libs.google.ai.edge.genai)

    testImplementation(libs.junit)
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
    testImplementation("app.cash.turbine:turbine:1.1.0")
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.04.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}